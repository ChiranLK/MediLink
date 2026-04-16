function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#1e293b]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#334155] font-bold text-xl"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="text-[#334155]">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
