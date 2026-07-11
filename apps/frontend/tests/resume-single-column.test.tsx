import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResumeSingleColumn } from '@/components/resume/resume-single-column';
import type { ResumeData } from '@/components/dashboard/resume-component';

const makeData = (personalInfoOverrides: Record<string, string> = {}): ResumeData => ({
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1-555-0100',
    location: 'San Francisco, CA',
    ...personalInfoOverrides,
  },
});

const getCommaSpans = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll('span')).filter((s) => s.textContent === ',');

describe('ResumeSingleColumn header', () => {
  it('renders the header note under the contact row when set', () => {
    const { getByText } = render(
      <ResumeSingleColumn
        data={makeData({ headerNote: 'U.S. work authorized — no sponsorship required' })}
      />
    );
    expect(getByText('U.S. work authorized — no sponsorship required')).toBeTruthy();
  });

  it('renders no header note element when unset', () => {
    const { queryByText } = render(<ResumeSingleColumn data={makeData()} />);
    expect(queryByText(/work authorized/)).toBeNull();
  });

  it('renders one separator per contact pair, glued to the preceding item', () => {
    const { container } = render(<ResumeSingleColumn data={makeData()} />);
    const commas = getCommaSpans(container);
    // email, phone, location -> two separators
    expect(commas).toHaveLength(2);
    for (const comma of commas) {
      // The separator must live inside the same wrapping unit as the item it
      // follows (a SPAN), not as a bare child of the flex row (a DIV) — a bare
      // child can wrap onto its own line and strand the comma.
      expect(comma.parentElement?.tagName).toBe('SPAN');
      expect(comma.parentElement?.textContent?.endsWith(',')).toBe(true);
    }
  });

  it('renders no separator after the last contact item', () => {
    const { container } = render(<ResumeSingleColumn data={makeData()} />);
    const location = Array.from(container.querySelectorAll('span')).find(
      (s) => s.textContent === 'San Francisco, CA'
    );
    expect(location).toBeTruthy();
    // Walk up to the wrapping unit and confirm it carries no trailing comma.
    const wrapper = location?.closest('span.inline-flex')?.parentElement;
    expect(wrapper?.textContent?.trim().endsWith(',')).toBe(false);
  });
});
