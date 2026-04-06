import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Auth service eke thiyena User model ekata reference ekak [cite: 42]
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Doctor' // Doctor Management service eke thiyena doctor ta reference ekak [cite: 22]
    },
    appointmentDate: {
        type: Date,
        required: true // Patient appointment eka book karana dine 
    },
    symptoms: {
        type: String,
        required: true // AI eka analyze karanna ona symptoms tika [cite: 30]
    },
    aiSuggestions: {
        type: String, // AI Symptom Checker eken ena preliminary suggestions [cite: 30, 31]
        default: "No suggestions available"
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], // Real-time status tracking 
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);