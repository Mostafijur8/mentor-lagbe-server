import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { verifyToken, verifyStudent, verifyTutor, verifyAdmin } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { toObjectId, serializeDocument } from '../utils/helpers.js';
import { uploadToImgBB } from '../utils/imgbb.js';

const router = Router();

// Lists server health and database readiness.
router.get('/health', async (_req, res) => {
  try {
    await _req.app.locals.db.command({ ping: 1 });
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

router.get('/', (_req, res) => res.json({ name: 'MentorLagbe API', status: 'running' }));

// Registers a student or tutor account with the free plan.
router.post('/auth/signup', async (req, res) => {
  const { name, email, password, role = 'student', phone = '', bio = '', image = '' } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  if (!['student', 'tutor'].includes(role))
    return res.status(400).json({ message: 'Role must be student or tutor.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const users = req.app.locals.collections.users;
  const normalizedEmail = email.toLowerCase().trim();
  if (await users.findOne({ email: normalizedEmail }))
    return res.status(409).json({ message: 'An account already exists with this email.' });

  const user = {
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role,
    phone,
    bio,
    image,
    plan: 'free',
    createdAt: new Date(),
  };
  const result = await users.insertOne(user);
  const token = jwt.sign(
    { sub: result.insertedId.toString(), email: normalizedEmail, role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
  const { password: _password, ...safeUser } = user;
  res.status(201).json({ token, user: { ...safeUser, _id: result.insertedId.toString() } });
});

// Signs in a registered account and issues a JWT.
router.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required.' });
  const user = await req.app.locals.collections.users.findOne({
    email: email.toLowerCase().trim(),
  });
  if (!user || !(await bcrypt.compare(password, user.password || '')))
    return res.status(401).json({ message: 'Invalid email or password.' });

  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
  const { password: _password, ...safeUser } = user;
  res.json({ token, user: serializeDocument(safeUser) });
});

// Returns the JWT-authenticated user's current profile.
router.get('/auth/me', verifyToken, async (req, res) => {
  const id = toObjectId(req.user.sub);
  if (!id) return res.status(401).json({ message: 'Invalid account.' });
  const user = await req.app.locals.collections.users.findOne({ _id: id });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const { password: _password, ...safeUser } = user;
  res.json(safeUser);
});

// Updates the signed-in user's editable profile fields.
router.patch('/users/profile', verifyToken, async (req, res) => {
  const id = toObjectId(req.user.sub);
  if (!id) return res.status(400).json({ message: 'Invalid user id.' });
  const allowed = ['name', 'phone', 'bio', 'image'];
  const update = {};
  for (const key of allowed) if (typeof req.body[key] === 'string') update[key] = req.body[key];
  update.updatedAt = new Date();
  const result = await req.app.locals.collections.users.findOneAndUpdate(
    { _id: id },
    { $set: update },
    { returnDocument: 'after' },
  );
  if (!result) return res.status(404).json({ message: 'User not found.' });
  const { password: _password, ...safeUser } = result;
  res.json(safeUser);
});

// Uploads a profile or tuition image file directly to ImgBB.
router.post('/upload/image', verifyToken, imageUpload.single('image'), async (req, res) => {
  try {
    const url = await uploadToImgBB(
      req.file || req.body.imageUrl || req.body.image,
      process.env.IMGBB_API_KEY,
    );
    res.status(201).json({ url });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Searches, filters, paginates, and lists public approved tuition posts.
router.get('/tuitions', async (req, res) => {
  const { search = '', subject, classLevel, mode, page = '1', limit = '12', featured } = req.query;
  const filter = { approvalStatus: 'approved', isActive: true };
  if (search)
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
  if (subject) filter.subject = subject;
  if (classLevel) filter.classLevel = classLevel;
  if (mode) filter.mode = mode;

  const pageNumber = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));
  const collection = req.app.locals.collections.tuitions;
  if (featured) {
    const items = await collection.find(filter).sort({ createdAt: -1 }).limit(pageSize).toArray();
    return res.json(items.map(serializeDocument));
  }
  const total = await collection.countDocuments(filter);
  const items = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .toArray();
  res.json({
    tuitions: items.map(serializeDocument),
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  });
});

// Gets one public tuition by id.
router.get('/tuitions/:id', async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Tuition not found.' });
  const tuition = await req.app.locals.collections.tuitions.findOne({
    _id: id,
    approvalStatus: 'approved',
    isActive: true,
  });
  if (!tuition) return res.status(404).json({ message: 'Tuition not found.' });
  res.json(serializeDocument(tuition));
});

// Creates a tuition for a tutor, enforcing the free-plan post limit.
router.post('/tuitions', verifyToken, verifyTutor, async (req, res) => {
  const required = ['title', 'subject', 'classLevel', 'mode', 'monthlyFee', 'description'];
  if (required.some((key) => req.body[key] === undefined || req.body[key] === ''))
    return res.status(400).json({ message: 'All required tuition fields must be provided.' });
  if (!['Online', 'Offline'].includes(req.body.mode))
    return res.status(400).json({ message: 'Mode must be Online or Offline.' });

  const users = req.app.locals.collections.users;
  const tuitions = req.app.locals.collections.tuitions;
  const tutor = await users.findOne({ _id: toObjectId(req.user.sub) });
  if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });
  if (tutor.plan !== 'pro') {
    const postCount = await tuitions.countDocuments({ tutorEmail: tutor.email });
    if (postCount >= 2)
      return res
        .status(403)
        .json({
          message:
            'Free tutors can create up to 2 tuition posts. Upgrade to Pro for unlimited posts.',
        });
  }

  const tuition = {
    title: req.body.title.trim(),
    subject: req.body.subject.trim(),
    classLevel: req.body.classLevel,
    mode: req.body.mode,
    location: req.body.location || '',
    monthlyFee: Number(req.body.monthlyFee),
    daysPerWeek: Number(req.body.daysPerWeek || 0),
    bannerImage: req.body.bannerImage || '',
    description: req.body.description,
    tutorName: tutor.name,
    tutorEmail: tutor.email,
    approvalStatus: 'pending',
    isActive: true,
    createdAt: new Date(),
  };
  const result = await tuitions.insertOne(tuition);
  res.status(201).json(serializeDocument({ ...tuition, _id: result.insertedId }));
});

// Lists tuition posts belonging to the signed-in tutor.
router.get('/tutor/tuitions', verifyToken, verifyTutor, async (req, res) => {
  const tutor = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  if (!tutor) return res.status(404).json({ message: 'Tutor not found.' });
  const items = await req.app.locals.collections.tuitions
    .find({ tutorEmail: tutor.email })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(items.map(serializeDocument));
});

// Updates a tuition owned by the signed-in tutor.
router.patch('/tuitions/:id', verifyToken, verifyTutor, async (req, res) => {
  const id = toObjectId(req.params.id);
  if (!id) return res.status(404).json({ message: 'Tuition not found.' });
  const tutor = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const tuitions = req.app.locals.collections.tuitions;
  const tuition = await tuitions.findOne({ _id: id, tutorEmail: tutor?.email });
  if (!tuition) return res.status(404).json({ message: 'Tuition not found or not owned by you.' });

  const allowed = [
    'title',
    'subject',
    'classLevel',
    'mode',
    'location',
    'monthlyFee',
    'daysPerWeek',
    'bannerImage',
    'description',
    'isActive',
  ];
  const update = {};
  for (const key of allowed)
    if (req.body[key] !== undefined)
      update[key] = ['monthlyFee', 'daysPerWeek'].includes(key)
        ? Number(req.body[key])
        : req.body[key];
  update.updatedAt = new Date();
  const result = await tuitions.findOneAndUpdate(
    { _id: id },
    { $set: update },
    { returnDocument: 'after' },
  );
  res.json(serializeDocument(result));
});

// Deletes a tuition owned by the signed-in tutor.
router.delete('/tuitions/:id', verifyToken, verifyTutor, async (req, res) => {
  const id = toObjectId(req.params.id);
  const tutor = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const result = await req.app.locals.collections.tuitions.deleteOne({
    _id: id,
    tutorEmail: tutor?.email,
  });
  if (!result.deletedCount)
    return res.status(404).json({ message: 'Tuition not found or not owned by you.' });
  res.status(204).send();
});

// Submits a student application once for an approved tuition.
router.post('/applications', verifyToken, verifyStudent, async (req, res) => {
  const tuitionId = toObjectId(req.body.tuitionId);
  if (!tuitionId) return res.status(400).json({ message: 'A valid tuition id is required.' });
  const collections = req.app.locals.collections;
  const student = await collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const tuition = await collections.tuitions.findOne({
    _id: tuitionId,
    approvalStatus: 'approved',
    isActive: true,
  });
  if (!student || !tuition)
    return res.status(404).json({ message: 'Student or tuition not found.' });
  if (
    await collections.applications.findOne({
      tuitionId: tuitionId.toString(),
      studentEmail: student.email,
    })
  ) {
    return res.status(409).json({ message: 'You have already applied for this tuition.' });
  }

  const application = {
    tuitionId: tuitionId.toString(),
    tuitionTitle: tuition.title,
    subject: tuition.subject,
    monthlyFee: tuition.monthlyFee,
    tutorEmail: tuition.tutorEmail,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: req.body.studentPhone || student.phone || '',
    preferredSchedule: req.body.preferredSchedule || '',
    studentNote: req.body.studentNote || '',
    status: 'pending',
    appliedAt: new Date(),
  };
  const result = await collections.applications.insertOne(application);
  res.status(201).json(serializeDocument({ ...application, _id: result.insertedId }));
});

// Lists applications submitted by the signed-in student.
router.get('/student/applications', verifyToken, verifyStudent, async (req, res) => {
  const student = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const items = await req.app.locals.collections.applications
    .find({ studentEmail: student?.email })
    .sort({ appliedAt: -1 })
    .toArray();
  res.json(items.map(serializeDocument));
});

// Cancels a student's pending application.
router.delete('/applications/:id', verifyToken, verifyStudent, async (req, res) => {
  const id = toObjectId(req.params.id);
  const student = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const result = await req.app.locals.collections.applications.deleteOne({
    _id: id,
    studentEmail: student?.email,
    status: 'pending',
  });
  if (!result.deletedCount)
    return res.status(404).json({ message: 'Pending application not found.' });
  res.status(204).send();
});

// Lists applicants for every tuition owned by the signed-in tutor.
router.get('/tutor/applications', verifyToken, verifyTutor, async (req, res) => {
  const tutor = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const tuitions = await req.app.locals.collections.tuitions
    .find({ tutorEmail: tutor?.email }, { projection: { _id: 1 } })
    .toArray();
  const tuitionIds = tuitions.map((tuition) => tuition._id.toString());
  const items = await req.app.locals.collections.applications
    .find({ tuitionId: { $in: tuitionIds } })
    .sort({ appliedAt: -1 })
    .toArray();
  res.json(items.map(serializeDocument));
});

// Accepts or rejects an application that belongs to the signed-in tutor.
router.patch('/applications/:id/status', verifyToken, verifyTutor, async (req, res) => {
  if (!['accepted', 'rejected'].includes(req.body.status))
    return res.status(400).json({ message: 'Status must be accepted or rejected.' });
  const id = toObjectId(req.params.id);
  const collections = req.app.locals.collections;
  const tutor = await collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const application = await collections.applications.findOne({ _id: id });
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  const owned = await collections.tuitions.findOne({
    _id: toObjectId(application.tuitionId),
    tutorEmail: tutor?.email,
  });
  if (!owned)
    return res.status(403).json({ message: 'This application does not belong to your tuition.' });
  const result = await collections.applications.findOneAndUpdate(
    { _id: id },
    { $set: { status: req.body.status, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  res.json(serializeDocument(result));
});

// Gets role-specific overview statistics for dashboards.
router.get('/dashboard/stats', verifyToken, async (req, res) => {
  const collections = req.app.locals.collections;
  const id = toObjectId(req.user.sub);
  if (req.user.role === 'student') {
    const student = await collections.users.findOne({ _id: id });
    const applications = await collections.applications
      .find({ studentEmail: student?.email })
      .toArray();
    return res.json({
      totalApplied: applications.length,
      acceptedApplications: applications.filter((item) => item.status === 'accepted').length,
      pendingApplications: applications.filter((item) => item.status === 'pending').length,
      plan: student?.plan || 'free',
    });
  }
  if (req.user.role === 'tutor') {
    const tutor = await collections.users.findOne({ _id: id });
    const tuitions = await collections.tuitions.find({ tutorEmail: tutor?.email }).toArray();
    const ids = tuitions.map((item) => item._id.toString());
    const applicantCount = await collections.applications.countDocuments({
      tuitionId: { $in: ids },
    });
    return res.json({
      totalTuitions: tuitions.length,
      activeTuitions: tuitions.filter((item) => item.approvalStatus === 'approved' && item.isActive)
        .length,
      totalApplicants: applicantCount,
      plan: tutor?.plan || 'free',
    });
  }
  if (req.user.role === 'admin') {
    const [users, tutors, pendingTuitions, approvedTuitions, payments] = await Promise.all([
      collections.users.countDocuments(),
      collections.users.countDocuments({ role: 'tutor' }),
      collections.tuitions.countDocuments({ approvalStatus: 'pending' }),
      collections.tuitions.countDocuments({ approvalStatus: 'approved' }),
      collections.payments.find({ paymentStatus: 'paid' }).toArray(),
    ]);
    const revenue = payments.reduce((total, payment) => total + Number(payment.amount || 0), 0);
    return res.json({
      totalUsers: users,
      totalTutors: tutors,
      pendingTuitions,
      approvedTuitions,
      totalRevenue: revenue,
    });
  }
  res.status(403).json({ message: 'Unknown role.' });
});

// Lists every registered user for admin role management.
router.get('/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  const users = await req.app.locals.collections.users
    .find({}, { projection: { password: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  res.json(users.map(serializeDocument));
});

// Updates a registered user's role.
router.patch('/admin/users/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  if (!['student', 'tutor', 'admin'].includes(req.body.role))
    return res.status(400).json({ message: 'Invalid role.' });
  const id = toObjectId(req.params.id);
  const result = await req.app.locals.collections.users.findOneAndUpdate(
    { _id: id },
    { $set: { role: req.body.role, updatedAt: new Date() } },
    { returnDocument: 'after', projection: { password: 0 } },
  );
  if (!result) return res.status(404).json({ message: 'User not found.' });
  res.json(serializeDocument(result));
});

// Lists all tuition posts for admin moderation.
router.get('/admin/tuitions', verifyToken, verifyAdmin, async (_req, res) => {
  const items = await _req.app.locals.collections.tuitions.find().sort({ createdAt: -1 }).toArray();
  res.json(items.map(serializeDocument));
});

// Approves or rejects a submitted tuition listing.
router.patch('/admin/tuitions/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  if (!['approved', 'rejected'].includes(req.body.approvalStatus))
    return res.status(400).json({ message: 'Approval status must be approved or rejected.' });
  const id = toObjectId(req.params.id);
  const result = await req.app.locals.collections.tuitions.findOneAndUpdate(
    { _id: id },
    { $set: { approvalStatus: req.body.approvalStatus, updatedAt: new Date() } },
    { returnDocument: 'after' },
  );
  if (!result) return res.status(404).json({ message: 'Tuition not found.' });
  res.json(serializeDocument(result));
});

// Lists successful Stripe subscription payments for admin.
router.get('/admin/payments', verifyToken, verifyAdmin, async (req, res) => {
  const items = await req.app.locals.collections.payments.find().sort({ paidAt: -1 }).toArray();
  res.json(items.map(serializeDocument));
});

// Creates a Stripe Checkout session for the role-specific Pro plan.
router.post('/payments/checkout', verifyToken, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.status(503).json({ message: 'Stripe is not configured.' });
  const collections = req.app.locals.collections;
  const user = await collections.users.findOne({ _id: toObjectId(req.user.sub) });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const amount = user.role === 'tutor' ? 1500 : 1000;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: user.role === 'tutor' ? 'MentorLagbe Pro Tutor' : 'MentorLagbe Pro Student',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: user._id.toString(),
      userEmail: user.email,
      userRole: user.role,
      planName: 'Pro',
    },
    success_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/payment/cancel`,
  });
  res.status(201).json({ url: session.url, sessionId: session.id });
});

// Verifies a successful Checkout session and synchronizes the user's plan and payment record.
router.post('/payments/verify', verifyToken, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY)
    return res.status(503).json({ message: 'Stripe is not configured.' });
  if (!req.body.sessionId)
    return res.status(400).json({ message: 'A Stripe session id is required.' });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);
  if (session.payment_status !== 'paid')
    return res.status(402).json({ message: 'Payment is not complete.' });

  const collections = req.app.locals.collections;
  const userId = toObjectId(session.metadata?.userId || req.user.sub);
  const user = await collections.users.findOne({ _id: userId });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  await collections.users.updateOne(
    { _id: userId },
    { $set: { plan: 'pro', updatedAt: new Date() } },
  );

  const existing = await collections.payments.findOne({ stripeSessionId: session.id });
  if (!existing) {
    await collections.payments.insertOne({
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      planName: 'Pro',
      amount: (session.amount_total || 0) / 100,
      currency: (session.currency || 'usd').toUpperCase(),
      transactionId: session.payment_intent?.toString() || session.id,
      stripeSessionId: session.id,
      paymentStatus: 'paid',
      paidAt: new Date(),
    });
  }
  res.json({ message: 'Subscription activated.', plan: 'pro' });
});

// Adds or removes a tuition from a student's saved list.
router.post('/bookmarks/:tuitionId', verifyToken, verifyStudent, async (req, res) => {
  const tuitionId = toObjectId(req.params.tuitionId);
  if (!tuitionId) return res.status(400).json({ message: 'Invalid tuition id.' });
  const collections = req.app.locals.collections;
  const userId = toObjectId(req.user.sub);
  const tuition = await collections.tuitions.findOne({
    _id: tuitionId,
    approvalStatus: 'approved',
    isActive: true,
  });
  if (!tuition) return res.status(404).json({ message: 'Tuition not found.' });
  const user = await collections.users.findOne({ _id: userId });
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const bookmarks = (user.savedTuitions || []).map(String);
  const exists = bookmarks.includes(tuitionId.toString());
  if (!exists && user.plan !== 'pro' && bookmarks.length >= 5)
    return res.status(403).json({ message: 'Free students can save up to 5 tuitions.' });
  await collections.users.updateOne(
    { _id: userId },
    exists
      ? { $pull: { savedTuitions: tuitionId.toString() } }
      : { $addToSet: { savedTuitions: tuitionId.toString() } },
  );
  res.json({ saved: !exists });
});

// Lists a student's saved tuition posts.
router.get('/student/bookmarks', verifyToken, verifyStudent, async (req, res) => {
  const user = await req.app.locals.collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const ids = (user?.savedTuitions || []).map((id) => toObjectId(id)).filter(Boolean);
  const items = await req.app.locals.collections.tuitions.find({ _id: { $in: ids } }).toArray();
  res.json(items.map(serializeDocument));
});

// Adds a 1–5 star review when the student has an accepted application.
router.post('/tuitions/:tuitionId/reviews', verifyToken, verifyStudent, async (req, res) => {
  const tuitionId = toObjectId(req.params.tuitionId);
  const rating = Number(req.body.rating);
  if (!tuitionId || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be an integer from 1 to 5.' });
  const collections = req.app.locals.collections;
  const student = await collections.users.findOne({ _id: toObjectId(req.user.sub) });
  const accepted = await collections.applications.findOne({
    tuitionId: tuitionId.toString(),
    studentEmail: student?.email,
    status: 'accepted',
  });
  if (!accepted)
    return res
      .status(403)
      .json({ message: 'Only students with an accepted application can review this tuition.' });

  const review = {
    studentName: student.name,
    studentEmail: student.email,
    rating,
    comment: String(req.body.comment || '').trim(),
    createdAt: new Date(),
  };
  const result = await collections.tuitions.updateOne(
    { _id: tuitionId, 'reviews.studentEmail': { $ne: student.email } },
    { $push: { reviews: review } },
  );
  if (!result.modifiedCount)
    return res.status(409).json({ message: 'You have already reviewed this tuition.' });
  res.status(201).json(review);
});

// Seeds realistic connected demo data without using a second database collection.
router.post('/seed', async (req, res) => {
  if (process.env.SEED_SECRET && req.headers['x-seed-secret'] !== process.env.SEED_SECRET)
    return res.status(401).json({ message: 'Invalid seed secret.' });
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_SECRET)
    return res.status(403).json({ message: 'Seeding is disabled in production.' });
  const collections = req.app.locals.collections;
  if ((await collections.tuitions.countDocuments()) >= 12)
    return res.json({
      message: 'Demo data already exists.',
      count: await collections.tuitions.countDocuments(),
    });

  const tutors = [
    ['Rahim Hasan', 'rahim.tutor@example.com'],
    ['Nusrat Jahan', 'nusrat.tutor@example.com'],
    ['Tanvir Ahmed', 'tanvir.tutor@example.com'],
    ['Farhana Islam', 'farhana.tutor@example.com'],
  ];
  for (const [name, email] of tutors) {
    await collections.users.updateOne(
      { email },
      {
        $setOnInsert: {
          name,
          email,
          password: await bcrypt.hash('Password123!', 12),
          role: 'tutor',
          phone: '',
          bio: 'Experienced subject mentor.',
          image: '',
          plan: 'free',
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  const subjects = [
    ['Higher Math Mastery', 'Mathematics', 'Class 10', 'Online'],
    ['Physics for SSC', 'Physics', 'SSC', 'Offline'],
    ['Programming with JavaScript', 'Programming', 'University', 'Online'],
    ['IELTS Speaking Practice', 'IELTS', 'Adult', 'Online'],
    ['Organic Chemistry', 'Chemistry', 'HSC', 'Offline'],
    ['English Grammar Foundation', 'English', 'Class 8', 'Online'],
    ['Business Studies', 'Accounting', 'Class 9', 'Offline'],
    ['Bangla Literature', 'Bangla', 'SSC', 'Online'],
    ['Biology Revision', 'Biology', 'HSC', 'Offline'],
    ['Python for Beginners', 'Programming', 'Class 12', 'Online'],
    ['General Science', 'Science', 'Class 7', 'Offline'],
    ['SAT Math Preparation', 'Mathematics', 'SAT', 'Online'],
  ];
  const docs = subjects.map(([title, subject, classLevel, mode], index) => {
    const tutor = tutors[index % tutors.length];
    return {
      title,
      subject,
      classLevel,
      mode,
      location: mode === 'Offline' ? 'Dhaka, Bangladesh' : 'Google Meet',
      monthlyFee: 3000 + (index % 5) * 1000,
      daysPerWeek: 3 + (index % 3),
      bannerImage: `https://images.unsplash.com/photo-${1500000000000 + index}?auto=format&fit=crop&w=900&q=80`,
      description: `A structured ${subject} batch with assignments, tests, and personalized progress feedback.`,
      tutorName: tutor[0],
      tutorEmail: tutor[1],
      approvalStatus: 'approved',
      isActive: true,
      createdAt: new Date(Date.now() - index * 86400000),
    };
  });
  const result = await collections.tuitions.insertMany(docs);
  res.status(201).json({ message: 'Demo data seeded.', count: result.insertedCount });
});

export default router;
