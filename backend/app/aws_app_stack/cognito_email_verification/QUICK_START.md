# Quick Start Guide - Cognito Email Templates

## 🚀 Update Email Template

### HTML Template (Default - Recommended)

```bash
cd app/aws_app_stack/cognito_email_verification/scripts
./update_template.sh
```

### Plain Text Template

```bash
cd app/aws_app_stack/cognito_email_verification/scripts
./update_template.sh --text
```

## 📝 Edit Templates

### HTML Template
Edit: `user_verification_template/email_template.html`

**Features:**
- Modern, responsive design
- Purple gradient header
- Prominent CTA button
- Styled verification code box
- Mobile-friendly layout

### Plain Text Template
Edit: `user_verification_template/email_template.txt`

**Features:**
- Simple, clean text
- Works with all email clients
- Fallback option

## 🔍 Preview Template

Open in browser to preview:

```bash
open user_verification_template/email_template.html
```

## ✅ Verify Current Template

Check what's currently in Cognito:

```bash
/usr/local/bin/kaws_subtiter_cli cognito-idp describe-user-pool \
  --user-pool-id eu-west-1_zm3OfnfeQ \
  --region eu-west-1 \
  --query 'UserPool.VerificationMessageTemplate.EmailSubject'
```

## 📧 Template Variables

Keep these intact when editing:

- `{username}` - User's email address
- `{####}` - 6-digit verification code

## 🎨 Customization

### Colors
- Primary: `#667eea` (purple)
- Secondary: `#764ba2` (dark purple)
- Gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Verification Link
`https://subtiter.ai/api/v1/auth/confirm-signup/{username}/{####}`

## 📚 Full Documentation

See `user_verification_template/README.md` for complete documentation.

## ⚠️ Important Notes

1. **Always test** after updating templates
2. **Keep placeholders** `{username}` and `{####}` intact
3. **HTML is default** - no need to specify `--html`
4. **Inline CSS only** - for email client compatibility
5. **24-hour expiration** - verification codes expire after 24 hours

## 🆘 Support

Need help? Contact: support@subtiter.ai

