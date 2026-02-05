# Design Review Results: Lottery Page

**Review Date**: 2026-02-05
**Route**: /
**Focus Areas**: Visual Design, UX/Usability, Responsive/Mobile, Accessibility, Micro-interactions, Consistency, Performance

## Summary
The application features a vibrant, gaming-inspired aesthetic with good use of animations and interactive elements. However, it suffers from inconsistent styling methods (heavy reliance on inline styles and hardcoded colors) and significant accessibility gaps. The information hierarchy can be improved by making the history more accessible yet less intrusive.

## Issues

| # | Issue | Criticality | Category | Location |
|---|-------|-------------|----------|----------|
| 1 | Hardcoded colors used instead of Ant Design theme tokens (e.g., `#0f172a`, `#f59e0b`) | 🟡 Medium | Consistency | `components/LotteryPage.tsx:213, 274, 321` |
| 2 | Low contrast for "QUAY NGAY" button text in dark mode (dark text on dark background) | 🔴 Critical | Accessibility | `components/LotteryPage.tsx:363-369` |
| 3 | Sider width fixed at 400px takes up ~1/3 of standard screens, crowding the main content | 🟠 High | UX/Usability | `components/LotteryPage.tsx:394` |
| 4 | Missing ARIA labels and descriptive alt text for the logo avatar | 🟠 High | Accessibility | `components/LotteryPage.tsx:224-228` |
| 5 | No pagination for History table; may lead to performance lag as records accumulate | 🟡 Medium | Performance | `components/LotteryPage.tsx:432-441` |
| 6 | Heavy use of inline styles makes the code harder to maintain and overrides theme defaults | 🟡 Medium | Consistency | `components/LotteryPage.tsx:207-442` |
| 7 | Layout uses `height: 100vh` and `overflow: hidden`, which can cut off content on short viewports | 🟠 High | Responsive | `components/LotteryPage.tsx:207` |

## Criticality Legend
- 🔴 **Critical**: Breaks functionality or violates accessibility standards
- 🟠 **High**: Significantly impacts user experience or design quality
- 🟡 **Medium**: Noticeable issue that should be addressed
- ⚪ **Low**: Nice-to-have improvement

## Next Steps
1. **Migration to Tokens**: Refactor inline colors to use `token.colorPrimary`, `token.colorBgContainer`, etc., from `useToken()`.
2. **Accessibility Audit**: Fix button contrast and add ARIA labels to all interactive elements (`Switch`, `Button`).
3. **Layout Optimization**: Consider making the sidebar collapsible or using a drawer for mobile/tablet viewports to give more room to the lottery cards.