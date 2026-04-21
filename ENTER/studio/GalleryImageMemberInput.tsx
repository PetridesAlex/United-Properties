import {Card, Stack, Text} from '@sanity/ui'
import type {ImageValue} from '@sanity/types'
import type {ObjectInputProps} from 'sanity'

/**
 * Wraps the default image input for each gallery array item so editors know that
 * **bulk multi-select** happens in `PropertyGalleryInput` above, not in this single-image box.
 */
export function GalleryImageMemberInput(props: ObjectInputProps<ImageValue>) {
  const {renderDefault} = props

  return (
    <Stack space={3}>
      <Card padding={3} radius={2} shadow={1} tone="transparent">
        <Text size={1}>
          <strong>Multiple images at once:</strong> scroll up to the <strong>Upload multiple images</strong> area and
          use <strong>Add photos (multiple)</strong> or <strong>Add from Media library</strong>. Use the controls below
          only to replace or crop <em>this</em> image, or edit alt text.
        </Text>
      </Card>
      {typeof renderDefault === 'function' ? renderDefault(props) : null}
    </Stack>
  )
}
