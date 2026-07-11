import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResumeSingleColumn } from '@/components/resume/resume-single-column';
import { ResumeTwoColumn } from '@/components/resume/resume-two-column';
import { ResumeModern } from '@/components/resume/resume-modern';
import { ResumeModernTwoColumn } from '@/components/resume/resume-modern-two-column';
import { ResumeClean } from '@/components/resume/resume-clean';
import { ResumeLatex } from '@/components/resume/resume-latex';
import { ResumeVivid } from '@/components/resume/resume-vivid';
import type { ResumeData } from '@/components/dashboard/resume-component';

const NOTE = 'U.S. work authorized — no sponsorship required';

const makeData = (headerNote?: string): ResumeData => ({
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1-555-0100',
    location: 'San Francisco, CA',
    ...(headerNote ? { headerNote } : {}),
  },
});

// Every render template must show personalInfo.headerNote — a tailored PDF
// losing the work-authorization line because of the chosen template was a
// real field report.
const TEMPLATES: Array<[string, React.ComponentType<{ data: ResumeData }>]> = [
  ['ResumeSingleColumn', ResumeSingleColumn],
  ['ResumeTwoColumn', ResumeTwoColumn],
  ['ResumeModern', ResumeModern],
  ['ResumeModernTwoColumn', ResumeModernTwoColumn],
  ['ResumeClean', ResumeClean],
  ['ResumeLatex', ResumeLatex],
  ['ResumeVivid', ResumeVivid],
];

describe.each(TEMPLATES)('%s header note', (_name, Template) => {
  it('renders the header note when set', () => {
    const { getByText } = render(<Template data={makeData(NOTE)} />);
    expect(getByText(NOTE)).toBeTruthy();
  });

  it('renders no header note element when unset', () => {
    const { queryByText } = render(<Template data={makeData()} />);
    expect(queryByText(/work authorized/)).toBeNull();
  });
});
