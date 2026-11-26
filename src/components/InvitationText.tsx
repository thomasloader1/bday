import React from "react";
import { useConfig } from "./ConfigProvider";

/** The letter on /{id}: the first paragraph as the lead, the rest at reading size (edited in the dashboard). */
const InvitationText = () => {
  const { letter } = useConfig();
  const [lead, ...rest] = letter.paragraphs;

  return (
    <div className="max-w-[60ch] space-y-4 text-lg leading-relaxed text-ink-2">
      <p className="lead text-ink">{lead}</p>
      {rest.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
};

export default InvitationText;
