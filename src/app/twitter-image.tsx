import { renderSocialCard, socialCardAlt } from "./_og/social-card";

export const alt = socialCardAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return renderSocialCard();
}
