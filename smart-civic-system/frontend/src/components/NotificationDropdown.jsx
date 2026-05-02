import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown({ notifications, onClose, onRead, isOpen }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose}></div>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-semibold text-slate-200">Notifications</h3>
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-sm">Close</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">No new notifications</div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!notif.is_read) onRead(notif.id);
                      if (notif.issue_id) {
                        navigate(`/issues/${notif.issue_id}`);
                        onClose();
                      }
                    }}
                    className={`p-3 border-b border-slate-800/50 cursor-pointer transition-colors ${
                      notif.is_read ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      <div className="mt-1">
                        {!notif.is_read ? <span className="w-2 h-2 rounded-full bg-violet-500 inline-block"></span> : <span className="w-2 h-2 inline-block"></span>}
                      </div>
                      <div>
                        <p className="text-sm leading-tight">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
