const Review = require('../Models/Review')
const Chat = require('../Models/Chat')

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDateLabel(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

exports.getStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments()
    const flaggedCount = await Review.countDocuments({ flagged: true })
    const publishedCount = await Review.countDocuments({ status: 'PUBLISHED' })
    const avgResult = await Review.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ])
    const averageRating = avgResult[0]?.avgRating || 0

    const stats = [
      { label: 'Total Reviews', value: totalReviews, badge: `${flaggedCount} flags`, badgeColor: 'bg-green-50 text-green-600', color: 'green' },
      { label: 'Flagged Reviews', value: flaggedCount, badge: 'Needs review', badgeColor: 'bg-red-50 text-red-600', color: 'red' },
      { label: 'Published Reviews', value: publishedCount, badge: 'Live content', badgeColor: 'bg-blue-50 text-blue-600', color: 'blue' },
      { label: 'Average Rating', value: Number(averageRating.toFixed(1)), suffix: '/5', badge: 'Updated', badgeColor: 'bg-gray-100 text-gray-500', color: 'orange' },
    ]

    res.json({ stats })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load stats' })
  }
}

exports.getChart = async (req, res) => {
  try {
    const reviews = await Review.find({ createdAt: { $exists: true } }).lean()
    const counts = {}
    const recentDates = []
    const today = new Date()

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const key = toKey(date)
      recentDates.push({ key, label: formatDateLabel(date) })
      counts[key] = 0
    }

    reviews.forEach((review) => {
      const created = parseDate(review.createdAt)
      if (!created) return
      const key = toKey(created)
      if (key in counts) {
        counts[key] += 1
      }
    })

    const chartData = recentDates.map((entry) => ({
      day: entry.label,
      reports: counts[entry.key],
      users: Math.max(1, Math.round(counts[entry.key] * 0.85)),
    }))

    res.json({ chartData })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load chart' })
  }
}

exports.getClassifications = async (req, res) => {
  try {
    const reviews = await Review.find({ entityType: { $exists: true } }).lean()
    const counts = reviews.reduce((map, review) => {
      const key = review.entityType || 'Other'
      map[key] = (map[key] || 0) + 1
      return map
    }, {})

    const classifications = Object.entries(counts).map(([label, count]) => ({
      label,
      pct: Math.round((count / reviews.length) * 100) || 0,
      color: label === 'Guide' ? 'bg-brand' : label === 'Place' ? 'bg-orange-400' : 'bg-red-300',
    }))

    res.json({ classifications })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load classifications' })
  }
}

exports.getIncidents = async (req, res) => {
  try {
    const incidents = await Review.find({ $or: [{ flagged: true }, { status: { $in: ['FLAGGED', 'UNDER REVIEW'] } }] })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean()

    const formatted = incidents.map((incident) => ({
      name: incident.entityName || incident.reviewerName || 'Unknown',
      role: incident.entityType || 'Review',
      avatar: incident.entityAvatarUrl ? incident.entityAvatarUrl : incident.entityName?.slice(0, 2).toUpperCase() || 'RV',
      color: 'bg-blue-500',
      type: incident.entityType ? `${incident.entityType} Review` : 'Review',
      date: incident.createdAt ? new Date(incident.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
      time: incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      reason: incident.text || 'Flagged content',
      status: incident.status || 'Review',
      statusColor: incident.flagged ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
    }))

    res.json({ incidents: formatted })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load incidents' })
  }
}

exports.getReviews = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Number(req.query.limit) || 12)
    const filter = req.query.filter || 'all'
    const search = req.query.search?.trim() || ''
    const sortBy = req.query.sortBy || 'newest'

    const query = {}
    if (filter === 'places') query.entityType = 'Place'
    if (filter === 'guides') query.entityType = 'Guide'
    if (filter === 'negative') query.rating = { $lte: 2 }
    if (search) {
      query.$or = [
        { reviewerName: new RegExp(search, 'i') },
        { entityName: new RegExp(search, 'i') },
        { text: new RegExp(search, 'i') },
      ]
    }

    const total = await Review.countDocuments(query)
    const sort = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 }
    const reviews = await Review.find(query).sort(sort).skip((page - 1) * limit).limit(limit).lean()

    res.json({ reviews, total, page, pageCount: Math.ceil(total / limit), limit })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load reviews' })
  }
}

exports.getFraud = async (req, res) => {
  try {
    const search = req.query.search?.trim() || ''
    const query = {
      $or: [
        { flagged: true },
        { rating: { $lte: 2 } },
        { status: { $in: ['FLAGGED', 'UNDER REVIEW'] } },
      ],
    }
    if (search) {
      query.$or.push(
        { reviewerName: new RegExp(search, 'i') },
        { entityName: new RegExp(search, 'i') },
        { text: new RegExp(search, 'i') },
      )
    }

    const frauds = await Review.find(query).sort({ createdAt: -1 }).limit(50).lean()
    res.json({ frauds, total: frauds.length })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load fraud reports' })
  }
}

exports.getReports = async (req, res) => {
  try {
    const reviews = await Review.find().lean()
    const totalReviews = reviews.length
    const flaggedCount = reviews.filter((review) => review.flagged).length
    const publishedCount = reviews.filter((review) => review.status === 'PUBLISHED').length
    const averageRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / Math.max(1, totalReviews)

    const stats = [
      { label: 'Total Reports', value: totalReviews.toLocaleString(), trend: `${flaggedCount} flagged`, color: 'red' },
      { label: 'Guide Activity', value: `${publishedCount}`, trend: 'Published reviews', color: 'blue' },
      { label: 'Transaction Efficiency', value: `${averageRating.toFixed(1)}/5`, trend: 'Average rating', color: 'green' },
      { label: 'Response Rate', value: `${Math.max(0, 100 - flaggedCount)}%`, trend: 'Available', color: 'orange' },
    ]

    const grouped = {}
    const counts = {}
    reviews.forEach((review) => {
      const type = review.entityType || 'Other'
      counts[type] = (counts[type] || 0) + 1
      const date = parseDate(review.createdAt) || new Date()
      const key = toKey(date)
      grouped[key] = (grouped[key] || 0) + 1
    })

    const dataLabels = []
    const today = new Date()
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const key = toKey(date)
      dataLabels.push({ key, label: formatDateLabel(date) })
    }

    const chartData = dataLabels.map((entry) => ({ day: entry.label, reports: grouped[entry.key] || 0, users: Math.max(1, Math.round((grouped[entry.key] || 0) * 0.8)) }))

    const classifications = Object.entries(counts).map(([label, count]) => ({ label, pct: Math.round((count / Math.max(1, totalReviews)) * 100), color: label === 'Guide' ? 'bg-brand' : label === 'Place' ? 'bg-orange-400' : 'bg-red-300' }))

    const incidents = reviews
      .filter((review) => review.flagged || ['FLAGGED', 'UNDER REVIEW'].includes(review.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8)
      .map((review) => ({
        name: review.entityName || review.reviewerName || 'Unknown',
        role: review.entityType || 'Review',
        avatar: review.entityAvatarUrl || (review.entityName ? review.entityName.slice(0, 2).toUpperCase() : 'RV'),
        color: 'bg-blue-500',
        type: review.entityType ? `${review.entityType} Report` : 'Review',
        date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown',
        time: review.createdAt ? new Date(review.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
        reason: review.text || 'Flagged content',
        status: review.status || 'Review',
        statusColor: review.flagged ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
      }))

    res.json({ stats, chartData, classifications, incidents })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load report data' })
  }
}

exports.getFraudById = async (req, res) => {
  try {
    const id = req.params.id
    const review = await Review.findById(id).lean()
    if (!review) return res.status(404).json({ error: 'Not found' })
    res.json({ fraud: review })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to load fraud item' })
  }
}

exports.flagReview = async (req, res) => {
  try {
    const { id, reason } = req.body
    if (!id) return res.status(400).json({ error: 'id is required' })
    const updated = await Review.findByIdAndUpdate(id, { flagged: true, flagReason: reason || 'Manual flag', status: 'FLAGGED' }, { new: true }).lean()
    res.json({ updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to flag review' })
  }
}

exports.unflagReview = async (req, res) => {
  try {
    const { id } = req.body
    if (!id) return res.status(400).json({ error: 'id is required' })
    const updated = await Review.findByIdAndUpdate(id, { flagged: false, flagReason: '', status: 'PUBLISHED' }, { new: true }).lean()
    res.json({ updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to unflag review' })
  }
}

exports.updateFraud = async (req, res) => {
  try {
    const id = req.params.id
    const updates = req.body || {}
    delete updates._id
    const updated = await Review.findByIdAndUpdate(id, updates, { new: true }).lean()
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json({ updated })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update fraud item' })
  }
}

exports.dbScan = async (req, res) => {
  try {
    const { MongoClient } = require('mongodb')
    const uri = process.env.MONGO_URI
    if (!uri) return res.status(400).json({ error: 'MONGO_URI not set' })

    const client = new MongoClient(uri)
    await client.connect()
    const admin = client.db().admin()
    const info = await admin.listDatabases()
    const found = []
    for (const db of info.databases) {
      try {
        const cols = await client.db(db.name).listCollections().toArray()
        const names = cols.map((c) => c.name)
        if (names.some((n) => /reviews|fraud/i.test(n))) {
          const entry = { db: db.name, collections: names }
          if (names.includes('reviews')) {
            try { entry.reviewsCount = await client.db(db.name).collection('reviews').countDocuments() } catch (e) { entry.reviewsCount = null }
          }
          if (names.includes('fraud')) {
            try { entry.fraudCount = await client.db(db.name).collection('fraud').countDocuments() } catch (e) { entry.fraudCount = null }
          }
          found.push(entry)
        }
      } catch (e) {
        // ignore per-db errors
      }
    }
    await client.close()
    res.json({ found })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to scan databases' })
  }
}

exports.migrateReviews = async (req, res) => {
  try {
    const { MongoClient } = require('mongodb')
    const uri = process.env.MONGO_URI
    if (!uri) return res.status(400).json({ error: 'MONGO_URI not set' })

    const sourceDbName = req.body?.source || 'test'
    const targetDbName = req.body?.target || process.env.MONGO_DB || 'Rafiq'
    const client = new MongoClient(uri)
    await client.connect()

    const sourceColl = client.db(sourceDbName).collection('reviews')
    const docs = await sourceColl.find().toArray()
    let migrated = 0
    for (const doc of docs) {
      const filter = { _id: doc._id }
      const replace = Object.assign({}, doc)
      try {
        await client.db(targetDbName).collection('reviews').replaceOne(filter, replace, { upsert: true })
        migrated += 1
      } catch (e) {
        // ignore individual errors
      }
    }
    await client.close()
    res.json({ migrated, source: sourceDbName, target: targetDbName })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Migration failed' })
  }
}

exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('touristId', 'name email')
      .populate('tourGuideId', 'name email')
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (err) {
    console.error('Failed to get all chats for admin:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('touristId', 'name email')
      .populate('tourGuideId', 'name email');

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.status(200).json(chat);
  } catch (err) {
    console.error('Failed to get chat by id for admin:', err);
    res.status(500).json({ error: 'Failed to fetch chat details' });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const deletedChat = await Chat.findByIdAndDelete(req.params.id);
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error('Failed to delete chat by admin:', err);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};
