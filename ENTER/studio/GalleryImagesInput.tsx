import {ImagesIcon} from '@sanity/icons'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
} from '@sanity/ui'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {insert, setIfMissing, useClient, type ArrayOfObjectsInputProps} from 'sanity'

type ImageAssetRow = {
  _id: string
  originalFilename?: string
  url?: string
}

const PAGE_SIZE = 48

function galleryAssetListQuery(start: number, end: number) {
  return `*[_type == "sanity.imageAsset"] | order(_createdAt desc) [${start}...${end}]{_id, originalFilename, url}`
}

/**
 * Wraps the default gallery array editor with a clear multi-select path.
 * Sanity's built-in "Insert image" dialog is always single-select; this adds checkboxes + bulk insert.
 */
export function GalleryImagesInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({apiVersion: '2022-11-15'})
  const {onChange, renderDefault} = props

  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState<ImageAssetRow[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchCount = useCallback(() => {
    client.fetch<number>('count(*[_type == "sanity.imageAsset"])').then(setTotal).catch(() => setTotal(0))
  }, [client])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const start = (page - 1) * PAGE_SIZE
    const end = start + PAGE_SIZE
    client
      .fetch<ImageAssetRow[]>(galleryAssetListQuery(start, end))
      .then(setRows)
      .finally(() => setLoading(false))
  }, [client, open, page])

  const selectedList = useMemo(() => [...selectedIds], [selectedIds])

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleInsert = useCallback(() => {
    if (selectedList.length === 0) return
    const patches = selectedList.map((id) =>
      insert(
        [
          {
            _key: id,
            _type: 'image',
            asset: {_ref: id, _type: 'reference'},
          },
        ],
        'after',
        [-1],
      ),
    )
    onChange([setIfMissing([]), ...patches])
    setSelectedIds(new Set())
    setOpen(false)
    setPage(1)
  }, [onChange, selectedList])

  const handleClose = useCallback(() => {
    setOpen(false)
    setSelectedIds(new Set())
    setPage(1)
  }, [])

  return (
    <Stack space={4}>
      <Card padding={4} radius={2} shadow={1} tone="transparent">
        <Stack space={3}>
          <Flex align="center" gap={3}>
            <Text size={2} weight="semibold">
              Add many photos from your Media library
            </Text>
            <ImagesIcon style={{opacity: 0.85}} />
          </Flex>
          <Text size={1} muted>
            The usual <strong>Select</strong> / <strong>Insert image</strong> window only picks one file at a time.
            Use the button below for <strong>checkboxes</strong> — tick several images, then insert them all at once.
          </Text>
          <Box>
            <Button
              icon={ImagesIcon}
              mode="default"
              tone="primary"
              text="Choose multiple images…"
              onClick={() => {
                setOpen(true)
                setPage(1)
                fetchCount()
              }}
            />
          </Box>
        </Stack>
      </Card>

      {renderDefault(props)}

      {open && (
        <Dialog
          header="Pick images (checkboxes)"
          id="gallery-multi-asset-picker"
          onClose={handleClose}
          width={100}
        >
          <Stack padding={4} space={4}>
            <Flex align="center" gap={3} justify="space-between" wrap="wrap">
              <Text muted size={1}>
                Page {page} of {totalPages} · {total} images in library
              </Text>
              <Flex gap={2} wrap="wrap">
                <Button
                  disabled={page <= 1}
                  mode="ghost"
                  text="Previous"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                />
                <Button
                  disabled={page >= totalPages}
                  mode="ghost"
                  text="Next"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                />
              </Flex>
            </Flex>

            {loading ? (
              <Flex align="center" justify="center" paddingY={5}>
                <Spinner />
              </Flex>
            ) : (
              <Grid columns={[2, 3, 4]} gap={3}>
                {rows.map((row) => {
                  const checked = selectedIds.has(row._id)
                  const label = row.originalFilename || row._id
                  return (
                    <Card
                      key={row._id}
                      padding={3}
                      radius={2}
                      tone={checked ? 'primary' : 'default'}
                    >
                      <Stack space={3}>
                        <Flex align="center" gap={3}>
                          <Checkbox
                            checked={checked}
                            id={`ga-${row._id}`}
                            onChange={() => toggle(row._id)}
                          />
                          <label htmlFor={`ga-${row._id}`}>
                            <Text size={1} weight="medium">
                              {label}
                            </Text>
                          </label>
                        </Flex>
                        {row.url ? (
                          <Box>
                            <img
                              alt=""
                              src={`${row.url}?w=240`}
                              style={{
                                width: '100%',
                                height: 120,
                                objectFit: 'contain',
                                display: 'block',
                                background: 'var(--card-muted-bg-color)',
                                borderRadius: 4,
                              }}
                            />
                          </Box>
                        ) : (
                          <Text muted size={1}>
                            No preview
                          </Text>
                        )}
                      </Stack>
                    </Card>
                  )
                })}
              </Grid>
            )}

            <Flex gap={2} justify="flex-end" wrap="wrap">
              <Button mode="ghost" onClick={handleClose} text="Cancel" />
              <Button
                disabled={selectedList.length === 0}
                onClick={handleInsert}
                text={
                  selectedList.length === 0
                    ? 'Insert selected'
                    : `Insert ${selectedList.length} image${selectedList.length === 1 ? '' : 's'}`
                }
                tone="primary"
              />
            </Flex>
          </Stack>
        </Dialog>
      )}
    </Stack>
  )
}
