import { groq } from 'next-sanity';

export const postsListQuery = groq`
  *[_type == "post" && defined(publishedAt) && publishedAt <= now()]
  | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    categories,
    author
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    body,
    publishedAt,
    categories,
    author,
    seoTitle,
    seoDescription
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)] { "slug": slug.current }
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && defined(publishedAt) && publishedAt <= now() && $category in categories]
  | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    categories,
    author
  }
`;

export const allCategoriesQuery = groq`
  array::unique(*[_type == "post" && defined(publishedAt)].categories[])
`;
