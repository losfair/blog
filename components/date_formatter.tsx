import React from "react";

export function DateFormatter({ dateMs }: { dateMs: number }) {
  const date = new Date(dateMs);
  const year = date.getUTCFullYear();
  const month = "" + (date.getUTCMonth() + 1);
  const day = "" + date.getUTCDate();
  return <span className="font-mono">{`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`}</span>;
}