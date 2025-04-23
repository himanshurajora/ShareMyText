import React, { useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

interface TextInputProps {
  data: string;
  onDataChange: (value: string) => void;
  onTextInput: (event: React.KeyboardEvent) => void;
  onClearClick: () => void;
  onCopyOutputToInput: () => void;
  onFileDrop: (event: ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({
  data,
  onDataChange,
  onTextInput,
  onClearClick,
  onCopyOutputToInput,
  onFileDrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-base-200 shadow-xl"
    >
      <div className="card-body p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Input Text</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClearClick}
                className="btn btn-ghost btn-sm"
              >
                Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCopyOutputToInput}
                className="btn btn-ghost btn-sm"
              >
                Copy from Output
              </motion.button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={data}
              onChange={(e) => onDataChange(e.target.value)}
              onKeyDown={onTextInput}
              placeholder="Enter your text here..."
              className="textarea textarea-bordered w-full h-48 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
            />
            <div className="absolute bottom-2 right-2 text-sm text-base-content/50">
              Ctrl + Enter to share
            </div>
          </div>

          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary btn-sm"
            >
              Upload File
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={onFileDrop}
              className="hidden"
              accept=".txt,.md,.json,.csv"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TextInput; 