"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Recommendation } from "@/lib/recommendations";

type Props = {
  recommendation: Recommendation | null;
  onClose: () => void;
};

const priorityLabel: Record<Recommendation["priority"], string> = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
};

export default function RecommendationReview({ recommendation, onClose }: Props) {
  if (!recommendation) return null;

  return (
    <Dialog open={!!recommendation} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={recommendation.priority === "high" ? "destructive" : "secondary"}>
              {priorityLabel[recommendation.priority]}
            </Badge>
            <Badge variant="outline">{recommendation.confidence}% confidence</Badge>
          </div>
          <DialogTitle className="text-left text-xl">{recommendation.title}</DialogTitle>
          <DialogDescription className="text-left text-sm leading-relaxed">
            Why DEMETER recommended this action for your farm.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 text-sm">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              What
            </dt>
            <dd className="mt-0.5 font-medium">{recommendation.action}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              When
            </dt>
            <dd className="mt-0.5">{recommendation.when}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Where
            </dt>
            <dd className="mt-0.5">{recommendation.where}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Why
            </dt>
            <dd className="mt-0.5 leading-relaxed text-muted-foreground">{recommendation.reason}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Signals used
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {recommendation.signals.map((signal) => (
                <Badge key={signal} variant="secondary" className="text-[10px] font-normal">
                  {signal}
                </Badge>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sources
            </dt>
            <dd className="mt-0.5 capitalize text-muted-foreground">
              {recommendation.source.join(" · ")}
            </dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>
  );
}
