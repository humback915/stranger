import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getQuestions } from "@/actions/question";
import {
  getMyCustomQuestions,
  getCustomQuestionsToAnswer,
} from "@/actions/custom-question";
import { ROUTES } from "@/lib/constants/routes";
import QuestionsClient from "./QuestionsClient";

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [questionsResult, myCustomResult, toAnswerResult] = await Promise.all([
    getQuestions(),
    getMyCustomQuestions(),
    getCustomQuestionsToAnswer(),
  ]);

  if (questionsResult.error) {
    redirect(ROUTES.LOGIN);
  }

  return (
    <QuestionsClient
      questions={questionsResult.questions!}
      initialAnsweredMap={questionsResult.answeredMap!}
      totalCount={questionsResult.totalCount!}
      initialAnsweredCount={questionsResult.answeredCount!}
      myCustomQuestions={myCustomResult.questions ?? []}
      customQuestionsToAnswer={toAnswerResult.unanswered ?? []}
      answeredCustomQuestions={toAnswerResult.answered ?? []}
    />
  );
}
