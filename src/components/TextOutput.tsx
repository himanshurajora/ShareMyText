import React from 'react';
import { motion } from 'framer-motion';

interface TextOutputProps {
  received: string;
  decoded: string;
  decryptCode: string;
  onDecryptCodeChange: (value: string) => void;
  onDecryptClick: () => void;
  onCopyClick: () => void;
  onDownloadClick: () => void;
}

const TextOutput: React.FC<TextOutputProps> = ({
  received,
  decoded,
  decryptCode,
  onDecryptCodeChange,
  onDecryptClick,
  onCopyClick,
  onDownloadClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Output Text</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCopyClick}
                className="btn btn-ghost btn-sm"
              >
                Copy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDownloadClick}
                className="btn btn-ghost btn-sm"
              >
                Download
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={decoded || received}
              readOnly
              className="textarea textarea-bordered w-full h-48 resize-none bg-base-100"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Decryption Key</span>
              </label>
              <input
                type="password"
                value={decryptCode}
                onChange={(e) => onDecryptCodeChange(e.target.value)}
                placeholder="Enter decryption key..."
                className="input input-bordered w-full"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDecryptClick}
              className="btn btn-primary btn-sm"
            >
              Decrypt
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TextOutput; 