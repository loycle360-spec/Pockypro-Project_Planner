import { isCriticalRisk } from '@/src/lib/project-health';
import { validateIssue, validateMilestone, validateNote, validateRisk, validateStakeholder, validateTask } from '@/src/lib/validation';

describe('item validation', () => {
  it('rejects an empty task title', () => expect(validateTask({ title: '  ', dueDate: null })).toMatch(/title/));
  it('accepts a valid task', () => expect(validateTask({ title: 'Draft charter', dueDate: null })).toBeNull());

  it('rejects an empty milestone name', () => expect(validateMilestone({ name: '', targetDate: null })).toMatch(/name/));

  it('rejects an out-of-range risk score', () => expect(validateRisk({ risk: 'Vendor delay', probability: 6, impact: 3 })).toMatch(/Probability/));
  it('accepts a valid risk', () => expect(validateRisk({ risk: 'Vendor delay', probability: 3, impact: 3 })).toBeNull());

  it('rejects an empty issue title', () => expect(validateIssue({ title: '', priority: 'High' })).toMatch(/title/));
  it('rejects an empty stakeholder name', () => expect(validateStakeholder({ name: '', role: '' })).toMatch(/name/));
  it('rejects an empty note', () => expect(validateNote({ body: '   ' })).toMatch(/note/));
});

describe('risk criticality', () => {
  it('flags high probability and high impact as critical', () => expect(isCriticalRisk(4, 4)).toBe(true));
  it('does not flag a low-impact risk as critical', () => expect(isCriticalRisk(5, 2)).toBe(false));
});
