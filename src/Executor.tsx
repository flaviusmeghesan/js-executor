import React, { useState, useEffect } from 'react';

interface LogMessage {
  time: string;
  type: string;
  message: string;
  color: string;
}

const Executor: React.FC = () => {
  const [jsCode, setJsCode] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<LogMessage[]>([]);
  const [output, setOutput] = useState<React.ReactNode>('');

  const evalMessage = (type: string, message: string) => {
    if (type === 'err') {
      setOutput(<pre className="wrapped-pre" style={{ color: 'red' }}>{message}</pre>);
    } else if (type === 'success') {
      setOutput(<pre className="wrapped-pre" style={{ color: 'green' }}>{message}</pre>);
    } else {
      const colors: { [key: string]: string } = {
        log: '#ffffff',
        info: '#00bfff',
        warn: '#ffcc00',
        debug: '#ff69b4',
        error: '#ff6347',
      };
      setConsoleOutput(prevOutput => [
        ...prevOutput,
        {
          time: getCurrentTime(),
          type: type.toUpperCase(),
          message: message,
          color: colors[type] || '#ffffff',
        },
      ]);
    }
  };

  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleInfo = console.info;
    const originalConsoleDebug = console.debug;

    console.log = function (...args: any[]) {
      evalMessage('log', args.join(' '));
      originalConsoleLog.apply(console, args);
    };
    console.warn = function (...args: any[]) {
      evalMessage('warn', args.join(' '));
      originalConsoleWarn.apply(console, args);
    };
    console.error = function (...args: any[]) {
      evalMessage('error', args.join(' '));
      originalConsoleError.apply(console, args);
    };
    console.info = function (...args: any[]) {
      evalMessage('info', args.join(' '));
      originalConsoleInfo.apply(console, args);
    };
    console.debug = function (...args: any[]) {
      evalMessage('debug', args.join(' '));
      originalConsoleDebug.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      console.info = originalConsoleInfo;
      console.debug = originalConsoleDebug;
    };
  }, []);

  const getCurrentTime = (): string => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const handleExecute = () => {
    try {
      const trimmedCode = jsCode.trim();
      if (!trimmedCode.length) throw new Error("You can't run empty JS code in runtime!");
      const result = eval(trimmedCode);
      if (result !== undefined) {
        evalMessage('success', result.toString());
      }
    } catch (error: any) {
      evalMessage('err', error.message); 
    }
  };

  const handleClearConsole = () => {
    setConsoleOutput([]);
  };

  const handleClearResult = () => {
    setOutput('');
  };

  return (
    <div>
      <div className="input-section">
        <textarea
          id="jsInput"
          placeholder="Write your JS code here..."
          value={jsCode}
          onChange={(e) => setJsCode(e.target.value)}
        />
        <button id="executeBtn" onClick={handleExecute}>
          Execute
        </button>
      </div>

      <div className="console-section">
        <div className="console-controls">
          <button id="clearConsoleBtn" onClick={handleClearConsole}>
            Clear Console
          </button>
          <button id="clearResultBtn" onClick={handleClearResult}>
            Clear Result
          </button>
        </div>
        <h2>Console</h2>
        <div id="consoleOutput" className="console-output">
          {consoleOutput.map((log, index) => (
            <div key={index} style={{ color: log.color }}>
              {log.time} [{log.type}] {log.message}
            </div>
          ))}
        </div>
      </div>

      <h2>Result</h2>
      <div id="output" className="output">
        {output}
      </div>
    </div>
  );
};

export default Executor;
