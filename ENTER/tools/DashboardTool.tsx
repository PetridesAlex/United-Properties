import {useCallback, useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {Badge, Box, Button, Card, Flex, Grid, Heading, Spinner, Stack, Text} from '@sanity/ui'
import {DASHBOARD_STATS_QUERY} from '../lib/queries'

type DashboardData = {
  totalProperties: number
  forSale: number
  forRent: number
  featuredCount: number
  totalInquiries: number
  newLeads: number
  followUpLeads: number
  recentInquiries: Array<{
    _id: string
    fullName: string
    email?: string
    status?: string
    priority?: string
    _createdAt: string
    followUpDate?: string
  }>
  recentProperties: Array<{
    _id: string
    title?: string
    purpose?: string
    listingStatus?: string
    referenceId?: string
    _createdAt: string
    slug?: string
  }>
  upcomingFollowUps: Array<{
    _id: string
    fullName: string
    followUpDate?: string
    status?: string
    priority?: string
  }>
}

export function DashboardTool() {
  const client = useClient({apiVersion: '2024-01-01'})
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setErrorMessage(null)
      const result = await client.fetch<DashboardData>(DASHBOARD_STATS_QUERY)
      setData(result)
    } catch (err) {
      console.error(err)
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [client])

  useEffect(() => {
    load()
    const sub = client.listen('*[_type in ["property","inquiry"]]').subscribe(() => {
      load()
    })
    return () => sub.unsubscribe()
  }, [client, load])

  if (loading && !data) {
    return (
      <Flex padding={5} justify="center" align="center" style={{minHeight: 320}}>
        <Spinner muted />
      </Flex>
    )
  }

  if (errorMessage && !data) {
    return (
      <Box padding={4}>
        <Card padding={4} radius={2} tone="critical" shadow={1}>
          <Text>{errorMessage}</Text>
        </Card>
      </Box>
    )
  }

  if (!data) {
    return null
  }

  const stat = (label: string, value: number, tone?: 'positive' | 'caution' | 'critical') => (
    <Card padding={4} radius={2} shadow={1} tone={tone ? 'transparent' : 'default'}>
      <Stack space={3}>
        <Text size={1} muted>
          {label}
        </Text>
        <Text weight="bold" size={4}>
          {value}
        </Text>
      </Stack>
    </Card>
  )

  return (
    <Box padding={4}>
      <Stack space={5}>
        <Heading as="h1" size={3}>
          Overview
        </Heading>

        <Grid columns={[1, 2, 3, 4]} gap={3}>
          {stat('Total properties', data.totalProperties)}
          {stat('For sale', data.forSale)}
          {stat('For rent', data.forRent)}
          {stat('Featured', data.featuredCount)}
          {stat('Total inquiries', data.totalInquiries)}
          {stat('New leads', data.newLeads, 'positive')}
          {stat('Follow-up queue', data.followUpLeads, 'caution')}
        </Grid>

        <Flex gap={2} wrap="wrap">
          <Button
            text="Refresh"
            mode="ghost"
            tone="primary"
            onClick={() => {
              setLoading(true)
              load()
            }}
          />
        </Flex>

        <Grid columns={[1, 1, 2]} gap={4}>
          <Card padding={4} radius={2} shadow={1}>
            <Stack space={4}>
              <Heading as="h2" size={1}>
                Recent inquiries
              </Heading>
              <Stack space={3}>
                {data.recentInquiries?.length ? (
                  data.recentInquiries.map((row) => (
                    <Card key={row._id} padding={3} radius={2} tone="transparent" border>
                      <Flex justify="space-between" align="flex-start" gap={3}>
                        <Stack space={2}>
                          <Text weight="semibold">{row.fullName}</Text>
                          <Text size={1} muted>
                            {row.email}
                          </Text>
                        </Stack>
                        <Flex gap={2} wrap="wrap">
                          {row.status ? <Badge tone="primary">{row.status}</Badge> : null}
                          {row.priority === 'high' ? (
                            <Badge tone="critical">High</Badge>
                          ) : null}
                        </Flex>
                      </Flex>
                    </Card>
                  ))
                ) : (
                  <Text muted size={1}>
                    No inquiries yet.
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>

          <Card padding={4} radius={2} shadow={1}>
            <Stack space={4}>
              <Heading as="h2" size={1}>
                Recent properties
              </Heading>
              <Stack space={3}>
                {data.recentProperties?.length ? (
                  data.recentProperties.map((row) => (
                    <Card key={row._id} padding={3} radius={2} tone="transparent" border>
                      <Text weight="semibold">{row.title || 'Untitled'}</Text>
                      <Text size={1} muted>
                        {[row.referenceId, row.purpose, row.listingStatus].filter(Boolean).join(' · ')}
                      </Text>
                    </Card>
                  ))
                ) : (
                  <Text muted size={1}>
                    No properties yet.
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>

          <Card padding={4} radius={2} shadow={1}>
            <Stack space={4}>
              <Heading as="h2" size={1}>
                Upcoming follow-ups
              </Heading>
              <Stack space={3}>
                {data.upcomingFollowUps?.length ? (
                  data.upcomingFollowUps.map((row) => (
                    <Card key={row._id} padding={3} radius={2} tone="transparent" border>
                      <Text weight="semibold">{row.fullName}</Text>
                      <Text size={1} muted>
                        {row.followUpDate || '—'} · {row.status}
                      </Text>
                    </Card>
                  ))
                ) : (
                  <Text muted size={1}>
                    No follow-up dates set.
                  </Text>
                )}
              </Stack>
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </Box>
  )
}
