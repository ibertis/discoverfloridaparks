import type { StructureResolver } from 'sanity/structure';
import { Iframe } from 'sanity-plugin-iframe-pane';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Blog Posts')
        .schemaType('post')
        .child(
          S.documentTypeList('post')
            .title('Blog Posts')
            .child((documentId) =>
              S.document()
                .documentId(documentId)
                .schemaType('post')
                .views([
                  S.view.form(),
                  S.view
                    .component(Iframe)
                    .options({
                      url: (doc: { slug?: { current?: string } }) =>
                        doc?.slug?.current
                          ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/draft?secret=${process.env.NEXT_PUBLIC_SANITY_PREVIEW_SECRET}&slug=/blog/${doc.slug.current}`
                          : null,
                      reload: { button: true },
                    })
                    .title('Preview'),
                ])
            )
        ),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== 'post'
      ),
    ]);
