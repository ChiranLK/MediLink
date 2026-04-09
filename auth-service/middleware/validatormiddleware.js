import { body, param, validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/costomerrors.js";
import Patient from "../models/patient.js";

import mongoose, { mongo } from "mongoose";

const withValidationError = (validateValue) => {
  return [
    validateValue,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessage = errors.array().map((error) => error.msg);
        if (errorMessage[0].startsWith("Recycle item with")) {
          throw new NotFoundError(errorMessage);
        }

        if (errorMessage[0].startsWith("not authorized")) {
          throw new UnauthorizedError("not authorized to access this route");
        }

        throw new BadRequestError(errorMessage);
      }
      next();
    },
  ];
};

// validate User model

// --------------- validate register input --------------------------
export const validateRegisterInput = withValidationError([
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const patient = await Patient.findOne({ email });
      if (patient) {
        throw new BadRequestError("Email already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("location").notEmpty().withMessage("Location is required").trim(),
]);

// --------------- validate login input --------------------------
export const validateLoginInput = withValidationError([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);

// --------------- validate user update --------------------------
export const validateUpdateUserInput = withValidationError([
  body("fullName")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const patient = await Patient.findOne({ email });
      if (patient && patient._id.toString() !== req.patient.userId) {
        throw new BadRequestError("Email already exists");
      }
    }),
  body("phoneNumber")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty if provided"),
  body("role")
    .optional()
    .isIn(["user", "admin", "organizer"])
    .withMessage("Invalid role specified"),
  body("password")
    .not()
    .exists()
    .withMessage("Password cannot be updated through this route"),
]);

//--------------- validate photographer input --------------------------
export const validatePhotographerInput = withValidationError([
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const photographer = await Photographer.findOne({ email });
      if (photographer) {
        throw new BadRequestError("Email already exists");
      }
    }),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 1, max: 50 })
    .withMessage("Experience must be between 1 and 50 years"),
  body("availability")
    .isBoolean()
    .withMessage("Availability must be true or false")
    .optional(),
  body("ratings")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Ratings must be a number between 0 and 5")
    .optional(),
]);

//--------------- validate photographer input --------------------------
export const validateUpdatePhotographerInput = withValidationError([
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 1, max: 50 })
    .withMessage("Experience must be between 1 and 50 years"),
  body("availability")
    .isBoolean()
    .withMessage("Availability must be true or false")
    .optional(),
]);

// --------------- validate admin user update --------------------------
export const validateAdminUserUpdate = withValidationError([
  body("fullName")
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),
  body("phoneNumber")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),
  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty if provided"),
  body("role")
    .optional()
    .isIn(["patient", "admin", "doctor"])
    .withMessage("Invalid role specified"),
  param("id")
    .isMongoId()
    .withMessage("Invalid user ID")
    .custom(async (id, { req }) => {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new NotFoundError("Patient not found");
      }
      if (patient._id.toString() === req.patient.userId) {
        throw new UnauthorizedError("Cannot modify your own account");
      }
    }),
]);

// --------------- validate admin add user --------------------------
export const validateAdminAddUser = withValidationError([
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const patient = await Patient.findOne({ email });
      if (patient) {
        throw new Error("Email already exists");
      }
    }),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),

  body("location").notEmpty().withMessage("Location is required").trim(),

  body("role")
    .optional()
    .isIn(["user", "admin", "organizer"])
    .withMessage("Invalid role specified"),
]);

// --------------- validate menu item --------------------------
export const validateMenuItem = withValidationError([
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters")
    .trim(),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Appetizers",
      "Main Course",
      "Desserts",
      "Beverages",
      "Snacks",
      "Salads",
    ])
    .withMessage("Invalid category"),

  body("pricePerPlate")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("dietaryInfo")
    .optional()
    .custom((value) => {
      const validOptions = [
        "Vegetarian",
        "Vegan",
        "Gluten-Free",
        "Halal",
        "Kosher",
        "Nut-Free",
      ];
      if (Array.isArray(value)) {
        return value.every((item) => validOptions.includes(item));
      }
      return true;
    })
    .withMessage("Invalid dietary information provided"),

  body("ingredients")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(
          (item) => typeof item === "string" && item.trim().length > 0
        );
      }
      return true;
    })
    .withMessage("Ingredients must be non-empty strings"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("Availability must be true or false"),
]);

// --------------- validate event package --------------------------
export const validateEventPackage = withValidationError([


  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters")
    .trim(),

  body("type")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn([
      "Wedding",
      "Birthday",
      "Corporate",
      "Anniversary",
      "Graduation",
      "Other",
    ])
    .withMessage("Invalid event type"),

  body("pricePerPerson")
    .notEmpty()
    .withMessage("Price per person is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("minimumGuests")
    .notEmpty()
    .withMessage("Minimum guests is required")
    .isInt({ min: 1 })
    .withMessage("Minimum guests must be at least 1"),

  body("maximumGuests")
    .notEmpty()
    .withMessage("Maximum guests is required")
    .isInt({ min: 1 })
    .withMessage("Maximum guests must be at least 1")
    .custom((value, { req }) => {
      if (value < req.body.minimumGuests) {
        throw new Error(
          "Maximum guests must be greater than or equal to minimum guests"
        );
      }
      return true;
    }),

  body("services")
    .optional()
    .isArray()
    .withMessage("Services must be an array"),

  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("Availability must be true or false"),
]);

// --------------- validate venue --------------------------
export const validateVenue = withValidationError([
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  body("capacity.min")
    .notEmpty()
    .withMessage("Minimum capacity is required")
    .isInt({ min: 1 })
    .withMessage("Minimum capacity must be at least 1"),

  body("capacity.max")
    .notEmpty()
    .withMessage("Maximum capacity is required")
    .isInt({ min: 1 })
    .withMessage("Maximum capacity must be at least 1")
    .custom((value, { req }) => {
      // Convert values to numbers to ensure proper comparison
      const maxCapacity = Number(value);
      const minCapacity = Number(req.body.capacity.min);

      if (maxCapacity < minCapacity) {
        throw new Error(
          "Maximum capacity must be greater than or equal to minimum capacity"
        );
      }
      return true;
    }),

  body("facilities")
    .optional()
    .isString()
    .withMessage("Facilities must be a string")
    .isLength({ max: 5000 })
    .withMessage("Facilities cannot exceed 5000 characters"),

  body("rules")
    .optional()
    .isString()
    .withMessage("Rules must be a string")
    .isLength({ max: 5000 })
    .withMessage("Rules cannot exceed 5000 characters"),
]);

export const validateReview = withValidationError([
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),



  body("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isMongoId()
    .withMessage("Invalid event ID format")
    .custom(async (eventId) => {
      const event = await Event.findById(eventId);
      if (!event) {
        throw new NotFoundError("Event not found");
      }
    }),

  body("status")
    .optional()
    .isIn(["pending", "approved", "rejected"])
    .withMessage("Invalid status value"),

  body("replies.*.comment")
    .optional()
    .notEmpty()
    .withMessage("Reply comment cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Reply cannot exceed 500 characters")
    .trim(),

  body("replies.*.user")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID in reply"),
]);

// --------------- validate decoration --------------------------

export const validateDecoration = withValidationError(
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters")
      .trim(),

   
    body("items")
      .isArray()
      .withMessage("Items must be an array")
      .notEmpty()
      .withMessage("At least one item is required"),

    body("items.*.name").notEmpty().withMessage("Item name is required").trim(),

    body("items.*.quantity")
      .notEmpty()
      .withMessage("Item quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),

    body("pricePerDay")
      .notEmpty()
      .withMessage("Price per day is required")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),

    body("setupTime")
      .notEmpty()
      .withMessage("Setup time is required")
      .isFloat({ min: 0 })
      .withMessage("Setup time must be a positive number"),

    body("colorScheme.primary")
      .notEmpty()
      .withMessage("Primary color is required")
      .trim(),
  ],
  (req, res, next) => {
    console.log("Received request body in middleware:", req.body);
    next();
  }
);

// --------------- validate decoration review --------------------------
export const validateDecorationReview = withValidationError([
  body("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),

  body("comment").notEmpty().withMessage("Comment is required").trim(),
]);

// --------------- validate musical group --------------------------
export const validateMusicalGroup = withValidationError([
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters")
    .trim(),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("genre")
    .notEmpty()
    .withMessage("Genre is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Genre must be between 3 and 50 characters")
    .trim(),

  body("members")
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.every(
          (item) => typeof item === "string" && item.trim().length > 0
        );
      }
      return true;
    })
    .withMessage("members must be non-empty strings"),

  body("contactEmail")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .trim()
    .normalizeEmail(),

  body("contactPhone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),

  body("availableForEvents")
    .optional()
    .isBoolean()
    .withMessage("Available for events must be true or false"),

  body("rating")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Rating must be an integer between 0 and 5"),
]);

// -------------------------  staf validator middleware -------------------
export const validateStaff = withValidationError([
  body("fullName")
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Full name must be between 3 and 50 characters")
    .trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .trim()
    .normalizeEmail(),

  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[0-9]{10}$/)
    .withMessage("Please provide a valid 10-digit phone number"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn([
      "Event Manager",
      "Photography Infomation Manager",
      "Event Orgernizer",
      "Financial Officer",
      "Entertainment Manager",
      "Other",
    ])
    .withMessage(
      "Role must be one of: Manager, Photographer, Sound Engineer, Technician, Other"
    ),

  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 0, max: 99 })
    .withMessage("Experience must be between 0 and 99 years"),

  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be true or false"),

  body("ratings")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Ratings must be an integer between 0 and 5"),
]);

// --------------- validate event  --------------------------
export const validateEvent = withValidationError([
  body("title")
    .notEmpty()
    .withMessage("Event title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters")
    .trim(),

  body("type")
    .notEmpty()
    .withMessage("Event type is required")
    .isIn([
      "Wedding",
      "Birthday",
      "Corporate",
      "Anniversary",
      "Graduation",
      "Other",
    ])
    .withMessage("Invalid event type"),

  body("description")
    .notEmpty()
    .withMessage("Event description is required")
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
    .trim(),

  body("date")
    .notEmpty()
    .withMessage("Event date is required")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Event date cannot be in the past");
      }
      return true;
    }),

  body("time.start")
    .notEmpty()
    .withMessage("Start time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid start time format (HH:MM)"),

  body("time.end")
    .notEmpty()
    .withMessage("End time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid end time format (HH:MM)")
    .custom((value, { req }) => {
      if (value <= req.body.time.start) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("venue")
    .notEmpty()
    .withMessage("Venue is required")
    .isMongoId()
    .withMessage("Invalid venue ID format"),

  body("package")
    .notEmpty()
    .withMessage("Event package is required")
    .isMongoId()
    .withMessage("Invalid package ID format"),

  body("client")
    .notEmpty()
    .withMessage("Client information is required")
    .isMongoId()
    .withMessage("Invalid client ID format"),

  body("guests.count")
    .notEmpty()
    .withMessage("Guest count is required")
    .isInt({ min: 1 })
    .withMessage("Minimum one guest required"),

  body("guests.list.*.email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format for guest"),

  body("guests.list.*.phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Invalid phone number format for guest"),

  body("services.decoration")
    .optional()
    .isMongoId()
    .withMessage("Invalid decoration ID format"),

  body("services.photographer")
    .optional()
    .isMongoId()
    .withMessage("Invalid photographer ID format"),

  body("services.musicalGroup")
    .optional()
    .isMongoId()
    .withMessage("Invalid musical group ID format"),

  body("staff.*").optional().isMongoId().withMessage("Invalid staff ID format"),

  body("status")
    .optional()
    .isIn(["pending", "confirmed", "in-progress", "completed", "cancelled"])
    .withMessage("Invalid event status"),

  body("totalCost")
    .notEmpty()
    .withMessage("Total cost is required")
    .isFloat({ min: 0 })
    .withMessage("Total cost must be a positive number"),

  body("payment.status")
    .optional()
    .isIn(["pending", "partial", "completed"])
    .withMessage("Invalid payment status"),

  body("payment.amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Payment amount must be a positive number"),

  body("notes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Notes cannot exceed 500 characters")
    .trim(),
]);

// -------------------------  rental item middleware -------------------
export const validateRentalItem = withValidationError([
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters")
    .trim(),

  body("description")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters")
    .trim(),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Equipment", "Furniture", "Decor", "Other"])
    .withMessage("Category must be one of: Equipment, Furniture, Decor, Other"),

  body("rentalPrice")
    .notEmpty()
    .withMessage("Rental price is required")
    .isFloat({ min: 0 })
    .withMessage("Rental price must be a positive number"),


  body("rentalStartDate")
    .notEmpty()
    .withMessage("Rental start date is required")
    .isISO8601()
    .withMessage(
      "Rental start date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)"
    ),

  body("availability")
    .optional()
    .isBoolean()
    .withMessage("Availability must be true or false"),
]);
