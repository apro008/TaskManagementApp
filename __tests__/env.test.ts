import { env } from '../src/config/env';

describe('env config', () => {
  it('reads values from the env file', () => {
    expect(env.name).toBe('development');
    expect(env.firebaseProjectId).toBe('taskflow-dev');
  });

  it('parses numbers and booleans', () => {
    expect(env.enableFcm).toBe(false);
  });
});
