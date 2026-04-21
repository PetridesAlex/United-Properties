import {definePlugin} from 'sanity'
import {ControlsIcon, TaskIcon} from '@sanity/icons'
import {DashboardTool} from '../tools/DashboardTool'
import {CrmBoardTool} from '../tools/CrmBoardTool'

export const unitedPropertiesTools = definePlugin({
  name: 'united-properties-tools',
  tools: [
    {
      name: 'dashboard',
      title: 'Dashboard',
      icon: ControlsIcon,
      component: DashboardTool,
    },
    {
      name: 'crm-board',
      title: 'Lead board',
      icon: TaskIcon,
      component: CrmBoardTool,
    },
  ],
})
