import { modelById } from "./data";

function clip(text: string, max = 180) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export function previewReply(prompt: string, modelId: string, angle = 0) {
  const model = modelById(modelId);
  const topic = prompt.trim();
  const lower = topic.toLowerCase();
  const focus =
    angle === 1
      ? "Keep the answer short enough to scan."
      : angle === 2
        ? "Call out a risk or a tradeoff."
        : "Lead with the useful part.";

  if (/\b(compare|versus|vs\.?|difference)\b/.test(lower)) {
    const lenses = ["speed", "quality", "effort to maintain"];
    return [
      `${model.name} comparison, weighted toward ${lenses[angle % lenses.length]}. ${focus}`,
      "",
      "| Question | Option A | Option B |",
      "| --- | --- | --- |",
      "| Best when | You need something working today | The result will be reused for months |",
      "| Watch for | Hidden cleanup later | A slow start |",
      "",
      `Your prompt: “${clip(topic, 220)}”.`,
      "",
      "If you name the two options, I can fill this table with those instead of placeholders.",
    ].join("\n");
  }

  if (/\b(function|code|bug|typescript|react|error|api)\b/.test(lower)) {
    return [
      `${model.name} would treat this as a code question. ${focus}`,
      "",
      "What I would do first:",
      "- Restate the expected input and the failure you can already see.",
      "- Change one thing, then rerun the smallest example that failed.",
      "- Add a test for the empty, null, and boundary case next.",
      "",
      "```ts",
      "function nextStep(input: string) {",
      "  const value = input.trim();",
      "  if (!value) throw new Error('Input is empty');",
      "  return value;",
      "}",
      "```",
      "",
      `Working from your note: “${clip(topic)}”.`,
    ].join("\n");
  }

  if (/\b(resume|cover letter|interview|job|hiring)\b/.test(lower)) {
    return [
      `${model.name} would keep this concrete and specific to the role. ${focus}`,
      "",
      "A stronger version usually has three moves:",
      "1. Name the role and the outcome you want in the first line.",
      "2. Swap duties for results: what changed, for whom, and by how much.",
      "3. Close with the exact next step you want from the reader.",
      "",
      `Starting point you gave: “${clip(topic)}”.`,
      "",
      "Paste the job post or the current bullet and I will rewrite that piece only.",
    ].join("\n");
  }

  return [
    `${model.name}: ${focus}`,
    "",
    `Here is a direct take on “${clip(topic, 220)}”.`,
    "",
    "- Start with the decision or the sentence you need someone else to understand.",
    "- Separate facts you already have from assumptions.",
    "- End with one next action, not a list of ten.",
    "",
    "Tell me the audience and the length you want if this should become a draft you can send.",
  ].join("\n");
}
