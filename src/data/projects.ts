export type Project = {
  title: string
  description: string
  tech: string[]
  link?: string
}

export const projects: Project[] = [
  {
    title: 'SillyLittleFiles',
    description: 'A VPN program & documentation focused on secure remote access for small teams.',
    tech: ['ProtonVPN', 'OpenVPN', 'JavaScript'],
  },
]
