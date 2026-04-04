import { StatusCodes } from 'http-status-codes';
import { fetchPatientReportsUrl } from '../services/patientService.js';
import { BadRequestError } from '../errors/customErrors.js';

// @desc    View reports uploaded by a specific patient
// @route   GET /api/doctors/patient/:patientId/reports
// @access  Doctor
export const getPatientReports = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      throw new BadRequestError('patientId is required');
    }

    // Call the external service (mocked for now)
    const reports = await fetchPatientReportsUrl(patientId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Successfully retrieved patient reports',
      count: reports.length,
      data: reports
    });

  } catch (error) {
    next(error);
  }
};
