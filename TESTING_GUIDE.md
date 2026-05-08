# Manual Testing Guide (RT) - Transit Education

This document outlines the manual testing procedures for the Transit Education platform. It covers both the public-facing website and the administrative CMS portal.

---

## 1. Feature Checklist & Navigation

### 1.1 Public Frontend Pages
- [ ] **Homepage**: Hero, Stats, Destinations, Services, Success Stories, Testimonials, Branches.
- [ ] **About Us**: Mission, Vision, Team, Company Profile.
- [ ] **Study Abroad (Country Pages)**: Australia, Canada, Ireland, Italy, New Zealand, South Korea, UK, USA.
- [ ] **Services**: Admission Counselling, Scholarship Assistance, Student Visa Service, Test Preparation.
- [ ] **Courses**: Language Training, Test Preparation.
- [ ] **Blog**: Listing page, individual post pages.
- [ ] **Resources**: Downloadable guides and materials.
- [ ] **Contact Us**: Contact info, map, and inquiry form.

### 1.2 Interactive Components
- [ ] **Main Navigation**: Sticky header, dropdown menus, mobile hamburger menu.
- [ ] **Hero Carousel**: Success story slider and country carousel.
- [ ] **Contact Form**: Validation and submission logic.
- [ ] **Newsletter**: Footer subscription form.
- [ ] **Dynamic FAQ Accordions**: Expanding/collapsing sections.

### 1.3 CMS Portal
- [ ] **Authentication**: Login/Logout flow.
- [ ] **Dashboard**: Statistics cards and recent activity tables.
- [ ] **Students Manager**: CRUD operations for student applications.
- [ ] **Blog Editor**: TipTap rich text integration, image uploads, publishing flow.
- [ ] **FAQ Manager**: Category-specific FAQ management.
- [ ] **Country Manager**: Editing dynamic content for study abroad pages.
- [ ] **Media Library**: Asset management and deletion.

---

## 2. Step-by-Step Testing Instructions

### 2.1 Navigation & Responsive Design
| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Load the website on Desktop, Tablet, and Mobile. | Layout adjusts correctly without horizontal scrolling. |
| 2 | Click on each main menu item (About, Services, Blog). | Page navigates correctly to the respective URL. |
| 3 | Hover over "Study Abroad" and "Services" dropdowns. | Dropdown menus appear with country/service links. |
| 4 | Open the Mobile menu and click a link. | Menu closes and navigates to the selected page. |

### 2.2 Hero Success Slider & Country Carousel
| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Wait for the Hero slider to auto-play. | Success stories cycle every 5 seconds. |
| 2 | Click the left/right arrows on the "Visa Success" card. | Manually changes to the next/previous student. |
| 3 | Click a country card in the "Live Countries" carousel. | Navigates to that specific country's study-abroad page. |

### 2.3 Contact Form Submission
| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Navigate to `/contact`. | Form renders correctly with Name, Email, Phone, and Message fields. |
| 2 | Submit with empty fields. | Validation errors appear (e.g., "Name is required"). |
| 3 | Enter an invalid email (e.g., "test@test"). | Validation error: "Invalid email format". |
| 4 | Submit a valid form. | "Thank you" message appears or success toast notification shows. |

### 2.4 CMS - Blog Management
| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Log in to `/cms/login`. | Redirects to the Dashboard. |
| 2 | Go to "Blog Posts" and click "New Post". | TipTap editor opens correctly. |
| 3 | Enter title, content, select category, and hit "Save". | Post is saved as "Draft" and appears in the list. |
| 4 | Change status to "Published" and check the public `/blog`. | The new post appears on the frontend. |

### 2.5 CMS - Student & Application Management
| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Go to "Students" module. | List of student inquiries is visible. |
| 2 | Edit a student's status (e.g., to "APPROVED"). | Status badge updates instantly in the table. |
| 3 | Delete a student record. | Confirmation prompt appears; record is removed upon approval. |

---

## 3. Edge Cases & Error Handling

### 3.1 Form Validation
- [ ] **Empty Submission**: Ensure buttons are disabled or errors show when clicking "Submit" without data.
- [ ] **Invalid Phone**: Test phone fields with alphabets (should be blocked or errored).
- [ ] **Long Text**: Enter very long text in the contact message field (should wrap correctly in CMS).

### 3.2 Content Edge Cases
- [ ] **Missing Images**: Check how blog cards look if no featured image is uploaded (should use fallback/placeholder).
- [ ] **Draft Countries**: Set a country to "DRAFT" in CMS; ensure it disappears from the Hero carousel.
- [ ] **Large Files**: Attempt to upload a 20MB image to the media library (should show a size limit error).

### 3.3 Auth & Security
- [ ] **Unauthorized Access**: Try to visit `/cms` without logging in (should redirect to `/cms/login`).
- [ ] **Invalid Credentials**: Enter wrong password (should show "Invalid login credentials").
- [ ] **Expired Session**: Leave the CMS open for 24h and try to save (should prompt for re-login).

---

## 4. Expected Results Summary
- **Visuals**: Premium red (#A93226) branding consistent across all pages.
- **Speed**: Page loads under 2 seconds (measured via Lighthouse/DevTools).
- **SEO**: Meta titles and descriptions change based on the active country or blog post.
- **Interactions**: All buttons have hover states; transitions are smooth (Framer Motion).
