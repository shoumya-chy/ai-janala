import ChatInterface from "@/components/ChatInterface";

const EXAMPLE_QUESTIONS = [
  "What is AI?",
  "AI কী?",
  "How does AI affect my job?",
];

export default function DemoSection() {
  return (
    <section id="demo" className="bg-brand-green-light/40 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-4xl">
          Try it now. Ask anything about AI.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-gray-600 sm:text-lg">
          This is a live demo. Tap an example question below, or type your
          own in Bengali or English.
        </p>

        <div className="mt-8">
          <ChatInterface exampleQuestions={EXAMPLE_QUESTIONS} />
        </div>
      </div>
    </section>
  );
}
