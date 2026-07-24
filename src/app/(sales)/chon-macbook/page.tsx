import type { Metadata } from "next";
import { MacBookQuiz } from "./MacBookQuiz";
import "./quiz.css";

export const metadata: Metadata = {
  title: "Chọn MacBook theo nhu cầu",
  description: "Trả lời vài câu hỏi đơn giản để nhận gợi ý MacBook phù hợp từ MBMC.",
};

export default function ChooseMacBookPage() {
  return <MacBookQuiz />;
}
