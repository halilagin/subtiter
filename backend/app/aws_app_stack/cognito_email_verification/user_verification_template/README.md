# User Verification Email Template

This directory contains the email verification templates used by AWS Cognito when users register for Klippers.ai.

## Files

- `email_template.html` - **HTML email template** (recommended, default)
- `email_template.txt` - Plain text email template (fallback)
- `verification_template.json` - Legacy JSON format (deprecated)

## Template Variables

The following variables are automatically replaced by Cognito:

- `{username}` - The user's username (email)
- `{####}` - The verification code (6 digits)

## Updating the Template

### Using HTML Template (Recommended)

To update the email template with the HTML version:

```bash
cd ../scripts
./update_template.sh --html
```

Or simply (HTML is default):

```bash
cd ../scripts
./update_template.sh
```

### Using Plain Text Template

To update the email template with the plain text version:

```bash
cd ../scripts
./update_template.sh --text
```

## HTML Template Features

The HTML template (`email_template.html`) includes:

✅ **Modern, responsive design** - Looks great on all devices
✅ **Gradient header** - Eye-catching purple gradient
✅ **Prominent CTA button** - Clear "Verify Email Address" button
✅ **Styled verification code** - Large, easy-to-read code display
✅ **Feature highlights** - Lists benefits of verification
✅ **Professional styling** - Branded colors and typography
✅ **Mobile-friendly** - Responsive layout for mobile devices
✅ **Inline CSS** - Works with all email clients

### Design Elements

- **Color Scheme**: Purple gradient (#667eea to #764ba2)
- **Typography**: System fonts for maximum compatibility
- **Layout**: Centered, max-width 600px
- **Sections**:
  - Header with emoji and title
  - Welcome message
  - Verification button (primary CTA)
  - Manual code entry option
  - Expiration notice
  - Feature list
  - Support contact
  - Footer with branding

## Template Preview

The HTML template will render as a beautiful, modern email with:

1. **Header**: Purple gradient with 🎬 emoji and "Welcome to Klippers.ai"
2. **Body**: Clean white background with clear messaging
3. **Button**: Large, gradient button for verification
4. **Code Box**: Dashed border box with large verification code
5. **Features**: Highlighted list of platform benefits
6. **Footer**: Professional footer with contact info

## Testing the Template

To test the template locally, open the HTML file in a browser:

```bash
open email_template.html
```

Note: The `{username}` and `{####}` placeholders will appear as-is in the browser. Cognito will replace these when sending actual emails.

## Current Configuration

- **User Pool ID**: `eu-west-1_zm3OfnfeQ`
- **User Pool Name**: `klippers-user-pool`
- **Region**: `eu-west-1`
- **Verification Link**: `https://klippers.ai/api/v1/auth/confirm-signup/{username}/{####}`
- **Code Expiration**: 24 hours
- **Subject**: "Welcome to Klippers.ai - Verify Your Email 🎬"

## Email Client Compatibility

The HTML template is designed to work with:

- Gmail (web and mobile)
- Outlook (web and desktop)
- Apple Mail
- Yahoo Mail
- Mobile email clients (iOS, Android)

## Editing the Template

### HTML Template

Edit `email_template.html` to customize:

- Colors (search for `#667eea` and `#764ba2`)
- Text content
- Layout and spacing
- Features list
- Support contact information

**Important**: Keep the `{username}` and `{####}` placeholders intact!

### Inline Styles

All CSS is inline to ensure maximum email client compatibility. When editing:

- Keep styles inline (in `style=""` attributes or `<style>` tag)
- Test with multiple email clients
- Use tables for complex layouts if needed
- Avoid external CSS files or JavaScript

## Last Updated

November 2, 2025
