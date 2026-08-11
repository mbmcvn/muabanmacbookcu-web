"use client";

import Link from "next/link";
import { MachineImage } from "@/components/machine/MachineImage";
import type { InventoryMatchCardView, InventoryMatchViewState } from "./inventory-match-presentation";

function MatchCard({ match }: { match: InventoryMatchCardView }) {
  return (
    <article className="inventory-match-card">
      <Link href={`/may/${match.slug}`} aria-label={`Xem ${match.displayName}`}>
        <div className="inventory-match-image">
          <MachineImage image={match.image} variant="card" fill sizes="(max-width: 639px) 40vw, 260px" />
        </div>
        <div className="inventory-match-card-body">
          {match.budgetLabel ? <span className="inventory-match-budget">{match.budgetLabel}</span> : null}
          <h3>{match.displayName}</h3>
          <p className="inventory-match-specs">{match.specs}</p>
          <strong className="inventory-match-price">{match.price}</strong>
          {match.condition ? <p className="inventory-match-condition">{match.condition}</p> : null}
          <p className="inventory-match-reason"><strong>Vì sao khớp:</strong> {match.reason}</p>
          <span className="inventory-match-link">Xem chiếc máy này <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}

export function InventoryMatchSection({ state }: { state: InventoryMatchViewState | null }) {
  return (
    <section className="inventory-match-section" aria-labelledby="inventory-match-title" aria-live="polite">
      <header>
        <p className="quiz-eyebrow">Từ máy MBMC đang có</p>
        <h2 id="inventory-match-title">Máy MBMC đang có phù hợp</h2>
        <p>Đây là những máy đang có sẵn và khớp với gợi ý phía trên.</p>
      </header>
      {state === null ? <p className="inventory-match-state">Đang xem máy MBMC hiện có…</p> : null}
      {state?.status === "failed" ? <p className="inventory-match-state">Chưa tải được danh sách máy đang có.</p> : null}
      {state?.status === "empty" ? (
        <div className="inventory-match-state">
          <strong>Hiện MBMC chưa có máy khớp đủ tiêu chí của bạn.</strong>
          <p>MBMC vẫn giữ nguyên gợi ý phía trên thay vì hạ cấu hình chỉ để khớp với máy đang có.</p>
        </div>
      ) : null}
      {state?.status === "ready" ? (
        <>
          {state.mode === "above-budget" ? (
            <p className="inventory-match-notice">Hiện có máy phù hợp về nhu cầu, nhưng giá đang cao hơn mức bạn muốn dành.</p>
          ) : null}
          {state.hasSizeTradeoff ? (
            <p className="inventory-match-tradeoff">Bạn hay mang máy nhưng cũng thích màn hình rộng, nên các lựa chọn dưới đây cân bằng hai phía theo những cách khác nhau.</p>
          ) : null}
          <div className="inventory-match-grid">
            {state.matches.map((match) => <MatchCard key={match.code} match={match} />)}
          </div>
        </>
      ) : null}
    </section>
  );
}
