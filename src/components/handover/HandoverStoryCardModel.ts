import type { HomepageStoryDTO } from "@/data/handover/homepage-story";
import type { PeopleStorySummaryDTO } from "@/data/handover/people-story";

export type HandoverStoryCardModel = {
  customerLabel: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  href?: string | null;
};

export function mapHomepageStoryToCard(
  story: HomepageStoryDTO,
): HandoverStoryCardModel {
  return {
    customerLabel: story.customerLabel,
    title: story.title,
    excerpt: story.excerpt,
    imageUrl: story.imageUrl,
    href: story.peopleHref,
  };
}

export function mapPeopleStoryToCard(
  story: PeopleStorySummaryDTO,
): HandoverStoryCardModel {
  return {
    customerLabel: story.customerLabel,
    title: story.title,
    excerpt: story.excerpt,
    imageUrl: story.coverImage,
    href: `/people/${story.slug}`,
  };
}
