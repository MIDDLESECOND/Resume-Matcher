"""Content guards on the tailoring prompts.

Two invariants this locks:
1. JD-keyword incorporation is the DEFAULT across sections (the maintainer goal).
2. The anti-fabrication clauses stay present. Per the truthfulness audit,
   invented bullet *narrative* (e.g. "led 12 engineers") is NOT caught by
   verify_diff_result (its metric regex misses bare counts) or verify_alignment
   (which only checks skills/certs/companies) — so these prompt clauses are the
   ONLY guard. If a future edit drops them, this test fails loudly.
"""

from app.prompts.templates import (
    COVER_LETTER_PROMPT,
    DIFF_IMPROVE_PROMPT,
    INTERVIEW_PREP_PROMPT,
)
from app.prompts.refinement import KEYWORD_INJECTION_PROMPT


class TestJdIncorporationIsDefault:
    def test_diff_prompt_reframes_by_default(self):
        assert "By DEFAULT" in DIFF_IMPROVE_PROMPT
        assert "reframe" in DIFF_IMPROVE_PROMPT.lower()

    def test_keyword_injection_integrates_without_bolt_ons(self):
        # The injection pass must weave keywords into existing sentences —
        # appended filler sentences ("This involved X.") read as AI-written
        # and were reported from real tailoring runs.
        assert "NEVER append an extra sentence" in KEYWORD_INJECTION_PROMPT
        assert "leave that content unchanged" in KEYWORD_INJECTION_PROMPT

    def test_diff_prompt_integrates_without_bolt_ons(self):
        # The diff stage produced the same bolt-on artifact in field reports
        # ("This dashboard provided key Total Rewards insights.") — the rule
        # must exist here too, not just in the refiner's injection prompt.
        assert "NEVER append an extra sentence" in DIFF_IMPROVE_PROMPT

    def test_parse_schema_carries_header_note(self):
        # Without headerNote in the parse schema, work-authorization /
        # relocation lines are silently dropped at upload and can never be
        # rendered by any template.
        from app.prompts.templates import RESUME_SCHEMA_EXAMPLE

        assert '"headerNote"' in RESUME_SCHEMA_EXAMPLE

    def test_cover_letter_reframes_in_jd_terminology(self):
        assert "terminology" in COVER_LETTER_PROMPT.lower()


class TestAntiFabricationClausesPresent:
    def test_diff_prompt_keeps_no_invented_work_clauses(self):
        # rule 11's reframe permission must ship WITH its anti-fabrication clause
        assert "Do NOT add new work, metrics, or responsibilities" in DIFF_IMPROVE_PROMPT
        # rule 2 must remain
        assert "Do not invent metrics or achievements not supported by the original resume" in DIFF_IMPROVE_PROMPT

    def test_keyword_injection_keeps_no_invent_clauses(self):
        assert "do not invent new content, metrics, or work history" in KEYWORD_INJECTION_PROMPT
        assert "Do NOT add skills, technologies, or certifications not in the master resume" in KEYWORD_INJECTION_PROMPT

    def test_cover_letter_keeps_no_invent_clauses(self):
        assert "Do NOT invent information not in the resume" in COVER_LETTER_PROMPT
        assert "proven experience supports it" in COVER_LETTER_PROMPT

    def test_interview_prep_keeps_no_fabrication_guardrails(self):
        assert "Do NOT invent experience" in INTERVIEW_PREP_PROMPT
        assert "tools, employers, metrics, certifications, skills" in INTERVIEW_PREP_PROMPT
        assert "Skill gaps are preparation targets only" in INTERVIEW_PREP_PROMPT
        assert "Do NOT translate JSON property names" in INTERVIEW_PREP_PROMPT
        assert "role_fit_analysis" in INTERVIEW_PREP_PROMPT
        assert "talking_points" in INTERVIEW_PREP_PROMPT
