import ContactMessage from "../models/ContactMessage.js";

// POST /api/auth/contact — public, no auth required
export const submitContactMessage = async (req, res) => {
  const { name, email, topic, message } = req.body;

  if (!name || !email || !topic || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const msg = await ContactMessage.create({ name, email, topic, message });
  res.status(201).json({ message: "Message sent successfully", id: msg._id });
};

// GET /api/auth/admin/messages — admin only
export const getAllMessages = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const status = req.query.status; // optional filter
  const search = req.query.search || "";

  const filter = {};
  if (status && ["unread", "read", "replied"].includes(status)) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { topic: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  const [messages, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ContactMessage.countDocuments(filter),
  ]);

  const unreadCount = await ContactMessage.countDocuments({ status: "unread" });

  res.status(200).json({
    messages,
    total,
    unreadCount,
    page,
    totalPages: Math.ceil(total / limit),
  });
};

// PATCH /api/auth/admin/messages/:id/status — admin only
export const updateMessageStatus = async (req, res) => {
  const { status } = req.body;
  if (!["unread", "read", "replied"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!msg) return res.status(404).json({ message: "Message not found" });

  res.status(200).json({ message: "Status updated", data: msg });
};

// DELETE /api/auth/admin/messages/:id — admin only
export const deleteMessage = async (req, res) => {
  const msg = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!msg) return res.status(404).json({ message: "Message not found" });
  res.status(200).json({ message: "Message deleted" });
};
