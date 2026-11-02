import { analysisSchema, type Analysis } from "./schema";
export const sampleText = `The quiet power of doing one thing

We have become remarkably good at filling every pause. An article waits in one tab, a message arrives in another, and a podcast plays underneath it all. It can feel productive. But feeling busy and making progress are different experiences.

Switching between demanding tasks carries a cost. Each switch asks us to rebuild the context of what we were doing. A student moving between an essay and a group chat might spend more time finding their place than they notice. This does not mean every interruption is harmful, or that people should work without breaks.

One approach is to choose a small, meaningful task and give it a protected interval. Put the phone out of reach, write down the next concrete action, and stop when the interval ends. The point is not to maximize every minute. It is to create enough quiet to notice what we actually understand.

Focused work is not a universal solution. A caregiver, a collaborative team, or someone waiting for an urgent call may need to stay available. Different tasks also call for different rhythms. Some benefit from conversation and exploration rather than isolation.

The author believes a more intentional relationship with information starts with a modest question: what deserves my attention right now? Before opening another tab, try explaining one idea you have already encountered in your own words. If that is difficult, it may be a useful invitation to return to the idea, not a judgment about your ability.

This original sample essay is supplied for demonstration. It includes illustrative reasoning, not independently cited research.`;
export function createDemo(): Analysis {
  return analysisSchema.parse({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    demo: true,
    input: {
      mode: "text",
      content: sampleText,
      title: "The quiet power of doing one thing",
      goal: "Understand the topic",
      depth: "Balanced",
      reflectionStyle: "Supportive",
    },
    sourceText: sampleText,
    sourceUrl: null,
    sourceCharacters: sampleText.length,
    result: {
      title: "The quiet power of doing one thing",
      topic: "Attention & intentional learning",
      summary:
        "The essay explores the difference between feeling busy and making meaningful progress. Its central suggestion is to protect a small interval for one worthwhile task, then explain what you understood. It treats focus as a flexible practice, while recognizing that care, collaboration, and urgent responsibilities can make uninterrupted work impractical.",
      mainArgument:
        "Intentional attention can create room for understanding, but focused work should adapt to the person and the task.",
      mainIdeas: [
        {
          title: "Busy is a feeling. Progress is a result.",
          explanation:
            "Opening more tabs and responding to more messages can feel productive without moving a meaningful task forward.",
        },
        {
          title: "Every switch asks you to find your place again.",
          explanation:
            "The author suggests that changing demanding tasks requires rebuilding context. The essay provides an example, rather than independent research evidence.",
        },
        {
          title: "Make focus small enough to practice.",
          explanation:
            "Choose one concrete action, protect a short interval, and stop deliberately. This is a practical suggestion, not a proven universal formula.",
        },
        {
          title: "Understanding starts with your own words.",
          explanation:
            "Trying to explain an idea can reveal questions worth revisiting. Difficulty explaining it is an invitation to learn, not a measure of ability.",
        },
      ],
      concepts: [
        {
          term: "Context switching",
          definition:
            "Moving between tasks and rebuilding the mental context each one needs.",
        },
        {
          term: "Teach-back",
          definition:
            "Explaining an idea in your own words to notice what is clear and what needs another look.",
        },
      ],
      limitations: [
        "The essay does not cite independent studies or quantify the cost of switching tasks.",
        "Protected focus may not suit urgent, collaborative, or caregiving responsibilities.",
      ],
      unresolvedQuestions: [
        "Which tasks benefit most from uninterrupted time?",
        "What would a fair comparison of focused and interrupted work measure?",
      ],
      claims: [
        {
          statement: "Switching between demanding tasks carries a cost.",
          category: "Factual assertion",
          explanation:
            "This is a testable statement about task performance. The essay does not supply a study or comparison that establishes its size or scope.",
          excerpt: "Switching between demanding tasks carries a cost.",
          context:
            "The author illustrates the idea with a student alternating between an essay and a group chat.",
          missingInformation:
            "Independent studies, task definitions, comparison groups, and measured outcomes.",
          whyItMatters:
            "It is a central reason offered for protecting time for one task.",
        },
        {
          statement:
            "A more intentional relationship with information starts by asking what deserves attention.",
          category: "Opinion",
          explanation:
            "This expresses the author's preferred way of approaching attention. It is a value judgment rather than a universal empirical conclusion.",
          excerpt: "what deserves my attention right now?",
          context:
            "The closing section invites the reader to choose a next action deliberately.",
          missingInformation:
            "The approach may work differently across people, responsibilities, and contexts.",
          whyItMatters:
            "It makes the essay's underlying value of personal agency visible.",
        },
        {
          statement:
            "Some tasks benefit from conversation and exploration rather than isolation.",
          category: "Interpretation",
          explanation:
            "The author offers a context-dependent counterpoint to uninterrupted focus, without defining which tasks or providing comparisons.",
          excerpt:
            "Some benefit from conversation and exploration rather than isolation.",
          context:
            "This appears alongside examples of caregivers and collaborative teams.",
          missingInformation:
            "Task-specific evidence and a clear definition of benefit.",
          whyItMatters:
            "It prevents the main recommendation from becoming an absolute rule.",
        },
      ],
      questions: [
        {
          kind: "Understanding",
          question:
            "In your own words, how does the author distinguish feeling busy from making progress?",
        },
        {
          kind: "Critical thinking",
          question:
            "What evidence would you need to test the claim about switching tasks? What else could explain a difference in performance?",
        },
        {
          kind: "Application",
          question:
            "Choose one task in your week. How could you try a short protected interval while respecting your other responsibilities?",
        },
      ],
      nextStep: {
        action:
          "Close the essay and explain its central idea in two sentences. Then return to one point you found difficult to explain.",
        reason:
          "Your goal is understanding. A brief teach-back gives you a concrete way to notice a question worth exploring.",
      },
    },
  });
}
