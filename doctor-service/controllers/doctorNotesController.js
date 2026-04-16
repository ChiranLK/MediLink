import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import DoctorNote from '../models/DoctorNote.js';

// @desc    Get all sticky clinical notes for a doctor
// @route   GET /api/doctors/:doctorId/notes
// @access  Doctor/Admin (Private)
export const getDoctorNotes = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      throw new BadRequestError('doctorId path parameter is required');
    }

    const notes = await DoctorNote.find({ doctorId }).sort({ updatedAt: -1 }).lean();

    res.status(StatusCodes.OK).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new sticky clinical note for a doctor
// @route   POST /api/doctors/:doctorId/notes
// @access  Doctor/Admin (Private)
export const createDoctorNote = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { title, content } = req.body;

    if (!doctorId) {
      throw new BadRequestError('doctorId path parameter is required');
    }

    const note = await DoctorNote.create({
      doctorId,
      title: title && title.trim() ? title : 'New clinical note',
      content: content || '',
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Clinical note created successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing sticky clinical note
// @route   PUT /api/doctors/:doctorId/notes/:noteId
// @access  Doctor/Admin (Private)
export const updateDoctorNote = async (req, res, next) => {
  try {
    const { doctorId, noteId } = req.params;
    const { title, content } = req.body;

    if (!doctorId || !noteId) {
      throw new BadRequestError('doctorId and noteId path parameters are required');
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const note = await DoctorNote.findOneAndUpdate(
      { _id: noteId, doctorId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!note) {
      throw new NotFoundError('Clinical note not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Clinical note updated successfully',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a sticky clinical note
// @route   DELETE /api/doctors/:doctorId/notes/:noteId
// @access  Doctor/Admin (Private)
export const deleteDoctorNote = async (req, res, next) => {
  try {
    const { doctorId, noteId } = req.params;

    if (!doctorId || !noteId) {
      throw new BadRequestError('doctorId and noteId path parameters are required');
    }

    const note = await DoctorNote.findOneAndDelete({ _id: noteId, doctorId });

    if (!note) {
      throw new NotFoundError('Clinical note not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Clinical note deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
