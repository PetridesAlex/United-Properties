/** Shared GROQ fragments for Studio tools */
export const DASHBOARD_STATS_QUERY = `
{
  "totalProperties": count(*[_type == "property"]),
  "forSale": count(*[_type == "property" && purpose == "sale"]),
  "forRent": count(*[_type == "property" && purpose == "rent"]),
  "featuredCount": count(*[_type == "property" && featured == true]),
  "totalInquiries": count(*[_type == "inquiry"]),
  "newLeads": count(*[_type == "inquiry" && status == "new"]),
  "followUpLeads": count(*[_type == "inquiry" && status == "follow_up"]),
  "recentInquiries": *[_type == "inquiry"] | order(_createdAt desc)[0...5]{
    _id,
    fullName,
    email,
    status,
    priority,
    _createdAt,
    followUpDate
  },
  "recentProperties": *[_type == "property"] | order(_createdAt desc)[0...5]{
    _id,
    title,
    purpose,
    listingStatus,
    referenceId,
    _createdAt,
    "slug": slug.current
  },
  "upcomingFollowUps": *[_type == "inquiry" && defined(followUpDate)]
    | order(followUpDate asc)[0...10]{
    _id,
    fullName,
    followUpDate,
    status,
    priority
  }
}
`

export const INQUIRY_BOARD_QUERY = `
  *[_type == "inquiry"] | order(_createdAt desc){
    _id,
    _createdAt,
    fullName,
    email,
    phone,
    inquiryType,
    status,
    priority,
    followUpDate,
    message,
    "propertyTitle": property->title,
    "agentName": assignedAgent->name,
    "agentPhoto": assignedAgent->photo
  }
`

/** Vision-ready report for CRM pipeline and upcoming follow-ups */
export const LEADS_REPORT_QUERY = `
{
  "summary": {
    "total": count(*[_type == "inquiry"]),
    "new": count(*[_type == "inquiry" && status == "new"]),
    "contacted": count(*[_type == "inquiry" && status == "contacted"]),
    "followUp": count(*[_type == "inquiry" && status == "follow_up"]),
    "viewingScheduled": count(*[_type == "inquiry" && status == "viewing_scheduled"]),
    "negotiation": count(*[_type == "inquiry" && status == "negotiation"]),
    "closed": count(*[_type == "inquiry" && status == "closed"]),
    "lost": count(*[_type == "inquiry" && status == "lost"]),
    "highPriorityOpen": count(*[
      _type == "inquiry" &&
      priority == "high" &&
      !(status in ["closed", "lost"])
    ])
  },
  "next7DaysFollowUps": *[
    _type == "inquiry" &&
    defined(followUpDate) &&
    followUpDate >= now() &&
    followUpDate < dateTime(now()) + 60 * 60 * 24 * 7
  ] | order(followUpDate asc){
    _id,
    fullName,
    email,
    phone,
    status,
    priority,
    followUpDate,
    "propertyTitle": property->title,
    "assignedAgent": assignedAgent->name
  },
  "recentLeads": *[_type == "inquiry"] | order(_createdAt desc)[0...20]{
    _id,
    _createdAt,
    fullName,
    email,
    phone,
    status,
    priority,
    inquiryType,
    "propertyTitle": property->title,
    "assignedAgent": assignedAgent->name
  }
}
`

/** Vision-ready report grouped by assigned agent (workload + pipeline split) */
export const LEADS_BY_AGENT_QUERY = `
{
  "totals": {
    "allLeads": count(*[_type == "inquiry"]),
    "assignedLeads": count(*[_type == "inquiry" && defined(assignedAgent)]),
    "unassignedLeads": count(*[_type == "inquiry" && !defined(assignedAgent)])
  },
  "agents": *[_type == "agent"] | order(name asc){
    _id,
    name,
    email,
    phone,
    "leadCounts": {
      "total": count(*[_type == "inquiry" && assignedAgent._ref == ^._id]),
      "open": count(*[
        _type == "inquiry" &&
        assignedAgent._ref == ^._id &&
        !(status in ["closed", "lost"])
      ]),
      "highPriorityOpen": count(*[
        _type == "inquiry" &&
        assignedAgent._ref == ^._id &&
        priority == "high" &&
        !(status in ["closed", "lost"])
      ]),
      "new": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "new"]),
      "contacted": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "contacted"]),
      "followUp": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "follow_up"]),
      "viewingScheduled": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "viewing_scheduled"]),
      "negotiation": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "negotiation"]),
      "closed": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "closed"]),
      "lost": count(*[_type == "inquiry" && assignedAgent._ref == ^._id && status == "lost"])
    },
    "nextFollowUps": *[
      _type == "inquiry" &&
      assignedAgent._ref == ^._id &&
      defined(followUpDate)
    ] | order(followUpDate asc)[0...5]{
      _id,
      fullName,
      status,
      priority,
      followUpDate,
      "propertyTitle": property->title
    }
  },
  "unassignedRecent": *[
    _type == "inquiry" &&
    !defined(assignedAgent)
  ] | order(_createdAt desc)[0...20]{
    _id,
    _createdAt,
    fullName,
    email,
    phone,
    status,
    priority,
    followUpDate,
    "propertyTitle": property->title
  }
}
`
