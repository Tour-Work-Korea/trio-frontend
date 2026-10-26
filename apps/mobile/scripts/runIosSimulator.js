const {spawnSync} = require('child_process');

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: options.capture ? 'pipe' : 'inherit',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }

  return result.stdout || '';
};

const parseRuntimeVersion = runtime => {
  const match = runtime.match(/iOS-(\d+)-(\d+)/);
  return match ? [Number(match[1]), Number(match[2])] : [0, 0];
};

const compareVersionsDesc = (left, right) => {
  const [leftMajor, leftMinor] = parseRuntimeVersion(left.runtime);
  const [rightMajor, rightMinor] = parseRuntimeVersion(right.runtime);
  return rightMajor - leftMajor || rightMinor - leftMinor;
};

const simulatorJson = JSON.parse(
  run('xcrun', ['simctl', 'list', 'devices', 'available', '--json'], {
    capture: true,
  }),
);

const simulators = Object.entries(simulatorJson.devices)
  .filter(([runtime]) => runtime.includes('iOS'))
  .flatMap(([runtime, devices]) =>
    devices
      .filter(
        device =>
          device.isAvailable !== false &&
          device.name.startsWith('iPhone'),
      )
      .map(device => ({...device, runtime})),
  );

const bootedSimulator = simulators.find(device => device.state === 'Booted');
const selectedSimulator =
  bootedSimulator ||
  [...simulators].sort((left, right) => {
    const versionOrder = compareVersionsDesc(left, right);
    if (versionOrder !== 0) {
      return versionOrder;
    }

    const leftPreferred = left.name.includes('Pro') ? 0 : 1;
    const rightPreferred = right.name.includes('Pro') ? 0 : 1;
    return leftPreferred - rightPreferred;
  })[0];

if (!selectedSimulator) {
  throw new Error(
    '사용 가능한 iPhone 시뮬레이터가 없습니다. Xcode에서 iOS Simulator Runtime을 설치해주세요.',
  );
}

console.log(
  `iOS 시뮬레이터 사용: ${selectedSimulator.name} (${selectedSimulator.udid})`,
);

if (selectedSimulator.state !== 'Booted') {
  run('xcrun', ['simctl', 'boot', selectedSimulator.udid]);
}

run('open', ['-a', 'Simulator']);
run('react-native', [
  'run-ios',
  '--udid',
  selectedSimulator.udid,
  '--extra-params',
  '-jobs 1',
]);
