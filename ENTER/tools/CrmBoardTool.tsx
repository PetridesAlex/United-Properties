import {useCallback, useEffect, useMemo, useState, type ReactNode} from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {useClient} from 'sanity'
import {Badge, Box, Button, Card, Flex, Grid, Heading, Stack, Text} from '@sanity/ui'
import {INQUIRY_STATUSES, INQUIRY_STATUS_ORDER, type InquiryStatusValue} from '../lib/constants'
import {INQUIRY_BOARD_QUERY} from '../lib/queries'
import {useIntentLink} from 'sanity/router'

type InquiryRow = {
  _id: string
  _createdAt: string
  fullName: string
  email?: string
  phone?: string
  inquiryType?: string
  status?: InquiryStatusValue
  priority?: string
  followUpDate?: string
  message?: string
  propertyTitle?: string
  agentName?: string
}

function columnIdForStatus(status: InquiryStatusValue) {
  return `col-${status}`
}

function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: string
  title: string
  count: number
  children: ReactNode
}) {
  const {setNodeRef, isOver} = useDroppable({id})
  return (
    <Card
      ref={setNodeRef}
      padding={3}
      radius={2}
      tone={isOver ? 'positive' : 'transparent'}
      border
      style={{minHeight: 280, minWidth: 220}}
    >
      <Stack space={3}>
        <Flex justify="space-between" align="center">
          <Heading as="h3" size={0}>
            {title}
          </Heading>
          <Badge>{count}</Badge>
        </Flex>
        <Stack space={3}>{children}</Stack>
      </Stack>
    </Card>
  )
}

function LeadCard({
  row,
  onStatusChange,
  patching,
}: {
  row: InquiryRow
  onStatusChange: (id: string, status: InquiryStatusValue) => void
  patching: boolean
}) {
  const {attributes, listeners, setNodeRef, transform, isDragging} = useDraggable({
    id: row._id,
  })
  const openLink = useIntentLink({
    intent: 'edit',
    params: {id: row._id, type: 'inquiry'},
  })

  const style = transform
    ? {transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0.7 : 1}
    : {opacity: isDragging ? 0.7 : 1}

  const high = row.priority === 'high'

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      padding={3}
      radius={2}
      shadow={1}
      tone={high ? 'critical' : 'default'}
      style={{
        ...style,
        cursor: 'grab',
        borderWidth: high ? 2 : 1,
        borderStyle: 'solid',
        borderColor: high ? 'var(--card-badge-critical-fg-color)' : 'var(--card-border-color)',
      }}
    >
      <Stack space={3}>
        <Flex justify="space-between" align="flex-start" gap={2}>
          <Text weight="semibold" size={1}>
            {row.fullName}
          </Text>
          {row.priority === 'high' ? (
            <Badge tone="critical">High</Badge>
          ) : (
            <Badge mode="outline">{row.priority || '—'}</Badge>
          )}
        </Flex>
        {row.propertyTitle ? (
          <Text size={1} muted>
            {row.propertyTitle}
          </Text>
        ) : null}
        <Text size={1}>{row.phone || row.email || '—'}</Text>
        <Flex gap={2} wrap="wrap">
          <Badge>{row.inquiryType || 'general'}</Badge>
          {row.agentName ? <Badge tone="primary">{row.agentName}</Badge> : null}
        </Flex>
        {row.followUpDate ? (
          <Text size={1}>FU: {row.followUpDate}</Text>
        ) : null}
        <Flex gap={2} wrap="wrap" align="center">
          <select
            value={row.status || 'new'}
            onChange={(e) =>
              onStatusChange(row._id, e.target.value as InquiryStatusValue)
            }
            disabled={patching}
            style={{
              font: 'inherit',
              padding: '0.45rem 0.5rem',
              borderRadius: 4,
              width: '100%',
              maxWidth: 180,
            }}
          >
            {INQUIRY_STATUSES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.title}
              </option>
            ))}
          </select>
          <Button
            as="a"
            href={openLink.href}
            onClick={openLink.onClick}
            text="Open"
            mode="ghost"
            tone="primary"
          />
        </Flex>
      </Stack>
    </Card>
  )
}

export function CrmBoardTool() {
  const client = useClient({apiVersion: '2024-01-01'})
  const [rows, setRows] = useState<InquiryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [patching, setPatching] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 6}}))

  const load = useCallback(async () => {
    try {
      setErrorMessage(null)
      const result = await client.fetch<InquiryRow[]>(INQUIRY_BOARD_QUERY)
      setRows(result || [])
    } catch (err) {
      console.error(err)
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    load()
    const sub = client.listen('*[_type == "inquiry"]').subscribe(() => load())
    return () => sub.unsubscribe()
  }, [client, load])

  const byStatus = useMemo(() => {
    const map = new Map<InquiryStatusValue, InquiryRow[]>()
    for (const s of INQUIRY_STATUS_ORDER) {
      map.set(s, [])
    }
    for (const row of rows) {
      const st = (row.status || 'new') as InquiryStatusValue
      const list = map.get(st) ?? []
      list.push(row)
      map.set(st, list)
    }
    for (const [k, list] of map) {
      list.sort((a, b) => (a._createdAt < b._createdAt ? 1 : -1))
      map.set(k, list)
    }
    return map
  }, [rows])

  const patchStatus = async (id: string, status: InquiryStatusValue) => {
    setPatching(true)
    try {
      await client.patch(id).set({status}).commit()
      await load()
    } catch (err) {
      console.error(err)
      setErrorMessage(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setPatching(false)
    }
  }

  const onDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event
    if (!over) return
    const inquiryId = String(active.id)
    const overId = String(over.id)
    if (!overId.startsWith('col-')) return
    const newStatus = overId.replace('col-', '') as InquiryStatusValue
    if (!INQUIRY_STATUS_ORDER.includes(newStatus)) return
    await patchStatus(inquiryId, newStatus)
  }

  if (loading) {
    return (
      <Flex padding={5} justify="center" align="center" style={{minHeight: 320}}>
        <Text muted>Loading board…</Text>
      </Flex>
    )
  }

  return (
    <Box padding={3}>
      <Stack space={4}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
          <Heading as="h1" size={3}>
            Lead board
          </Heading>
          <Button text="Refresh" mode="ghost" tone="primary" onClick={() => load()} />
        </Flex>

        {errorMessage ? (
          <Card padding={3} radius={2} tone="critical" shadow={1}>
            <Text size={1}>{errorMessage}</Text>
          </Card>
        ) : null}

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <Grid columns={[1, 2, 3, 4, 5, 6, 7]} gap={3}>
            {INQUIRY_STATUS_ORDER.map((status) => {
              const title =
                INQUIRY_STATUSES.find((t) => t.value === status)?.title ?? status
              const list = byStatus.get(status) ?? []
              return (
                <DroppableColumn
                  key={status}
                  id={columnIdForStatus(status)}
                  title={title}
                  count={list.length}
                >
                  {list.map((row) => (
                    <LeadCard
                      key={row._id}
                      row={row}
                      onStatusChange={patchStatus}
                      patching={patching}
                    />
                  ))}
                </DroppableColumn>
              )
            })}
          </Grid>
        </DndContext>
      </Stack>
    </Box>
  )
}
