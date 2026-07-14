const mongoose = require('mongoose');

const tourGuideProfileSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            default: 'guide',
        },
        avatarUrl: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        city: {
            type: String,
            default: '',
        },
        languages: [{ type: String, required: true }],
        status: {
            type: String,
            enum: {
                values: ['pending', 'approved', 'suspended'],
                message: "Status must be either 'pending', 'approved', or 'suspended'",
            },
            default: 'active',
        },
        rate: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: {
            type: Number,
            default: 0,
        },
        phone: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            default: '',
        },
        completedTrips: {
            type: Number,
            default: 0,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('TourGuideProfile', tourGuideProfileSchema);