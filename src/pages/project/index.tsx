import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/skeleton-card'
import { Project, IResultPagination } from '@/types'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  LucideSearch,
  LucideFlame,
  LucideThumbsUp,
  LucideSprout,
  LucideSparkles,
  LucideGift,
  LucidePickaxe,
  LucideZap,
  LucideRefreshCcw,
  LucideUser,
} from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useInfiniteScroll } from 'ahooks'
import { getLoadMoreProjectList } from '@/service'
import { DEFAULT_PAGINATION_LIMIT } from '@/constants/data'
import ImportProjectDialog from '@/components/import-project'
import { getAppearances } from '@/lib/appearances'

function SkeletonProjects({ count = 6 }: { count?: number }) {
  return (
    <div className="flex w-full flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

function renderTags(tags: string[]): React.ReactNode[] {
  return tags.map((tag) => {
    return (
      <div
        key={tag}
        className="border-greyscale-50/12 bg-greyscale-50/8 relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-muted p-1.5 transition-all duration-300 ease-in"
      >
        {getIconFromKey(tag)}
      </div>
    )
  })
}

function ProjectItem({ item }: { item: Project }) {
  return (
    <Link key={item._id} to={`/projects/${item.name}/tasks`}>
      <article className="group relative z-[1] w-full cursor-pointer rounded-2xl border p-4 !pr-0 !pt-0 transition-all duration-200 ease-in hover:scale-[0.998] hover:border hover:border-opacity-80 hover:bg-white/10 lg:p-6">
        <div className="flex gap-5">
          {/* 头像 */}
          <div className="pt-4">
            <Avatar>
              <AvatarImage src={item.owner.avatarUrl} />
              <AvatarFallback>{item.owner.login}</AvatarFallback>
            </Avatar>
          </div>
          <div className="overflow-hidden pr-4 pt-4">
            <div className="flex w-full items-center gap-2">
              <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-bold">
                <Button
                  asChild
                  variant="link"
                  className="overflow-hidden text-ellipsis whitespace-nowrap !p-0 text-2xl font-bold text-gray-50"
                >
                  <span
                    className="z-10"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(item.htmlUrl, '_blank')
                    }}
                  >
                    {item.name}
                  </span>
                </Button>
              </div>
              <div className="hidden gap-2 md:flex">{renderTags(item.youbetExtra?.tags || [])}</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{item.description || 'No description...'}</div>
            <div className="mt-5 flex flex-col gap-4 text-xs md:flex-row">
              <span>Pool Address</span>
              <span>{`0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(
                '',
              )}`}</span>
            </div>
            <div className="mt-5 flex flex-col gap-4 text-xs md:flex-row">
              <div className="flex gap-1 md:items-center md:justify-center">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={item.owner.avatarUrl} />
                  <AvatarFallback>{item.owner.login}</AvatarFallback>
                </Avatar>
                <span>project owner</span>
              </div>
              <div className="flex gap-1 md:items-center md:justify-center">
                <LucideUser className="h-4 w-4" />
                {Math.floor(Math.random() * 10)} contributors
              </div>
              {/* <div>Ecosystems</div> */}
              <div>Languages</div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

interface ProjectListProps {
  loading: boolean
  loadingMore: boolean
  data: IResultPagination<Project> | undefined
}
function ProjectList({ loading, loadingMore, data }: ProjectListProps) {
  if (loading) return <SkeletonProjects />
  if (!data) return null

  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden pt-4 lg:pl-4">
      <div className="flex items-center justify-between">
        <div>
          <Select defaultValue="treading">
            <SelectTrigger>
              <div>
                <span>Sort by </span>
                <span className="lowercase text-primary">
                  <SelectValue />
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="treading">Treading projects</SelectItem>
              <SelectItem value="project">Project name</SelectItem>
              <SelectItem value="contributors">Number of contributors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">{data.pagination.totalCount} Projects</div>
      </div>
      <div className="flex w-full flex-col gap-4">
        {data.list.map((item) => (
          <ProjectItem key={item._id} item={item} />
        ))}
        {loadingMore && <SkeletonProjects count={2} />}
      </div>
    </div>
  )
}

function getIconFromKey(key: string) {
  return {
    'issues-available': <LucideThumbsUp className="h-4 w-4" />,
    'hot-community': <LucideFlame className="h-4 w-4" />,
    'good-first-issues': <LucideSprout className="h-4 w-4" />,
    'big-whale': <LucideSparkles className="h-4 w-4" />,
    'potential-reward': <LucideGift className="h-4 w-4" />,
    'work-in-progress': <LucidePickaxe className="h-4 w-4" />,
    'fast-and-furious': <LucideZap className="h-4 w-4" />,
  }[key]
}

interface FilterBoardProps {
  filterTags: string[]
  setFilterTags: (tags: string[]) => void
}

function FilterBoard({ filterTags, setFilterTags }: FilterBoardProps) {
  const tags = [
    // {
    //   label: 'Issues available',
    //   value: 'issues-available',
    //   icon: getIconFromKey('issues-available'),
    // },
    {
      label: 'Hot Community',
      value: 'hot-community',
      icon: getIconFromKey('hot-community'),
    },
    {
      label: 'Good First Issues',
      value: 'good-first-issues',
      icon: getIconFromKey('good-first-issues'),
    },
    {
      label: 'Potential Reward',
      value: 'potential-reward',
      icon: getIconFromKey('potential-reward'),
    },
  ]

  return (
    <div className="w-full flex-shrink-0 pt-4 lg:w-48 xl:w-96">
      <Card className="sticky left-0 top-0 bg-transparent">
        <CardHeader className="py-4">
          <CardTitle className="relative text-lg">
            <span>Filter</span>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 flex -translate-y-1/2 cursor-pointer items-center gap-1 text-xs text-primary hover:text-primary"
              onClick={() => setFilterTags([])}
            >
              <LucideRefreshCcw className="h-3 w-3" />
              Clear all
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4">
          {/* filter */}
          <ToggleGroup type="multiple" value={filterTags} onValueChange={setFilterTags}>
            {tags.map((tag) => (
              <ToggleGroupItem key={tag.value} size="sm" value={tag.value}>
                {tag.icon}
                {tag.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {/* select */}
          {/* <div className="pt-2 space-y-3 border-t border-muted">
            <Label>Ecosystems</Label>
            <Select>
              <SelectTrigger className="w-full max-w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* select */}
          <div className="space-y-3 border-t border-muted pt-2">
            <Label>Languages</Label>
            <Select>
              <SelectTrigger className="w-full max-w-[180px]">
                <SelectValue placeholder="Select Languages..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solidity">Solidity</SelectItem>
                <SelectItem value="rust">Rust</SelectItem>
                <SelectItem value="move">Move</SelectItem>
                <SelectItem value="typescript">Typescript</SelectItem>
                <SelectItem value="javascript">javascript</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* select */}
          {/* <div className="pt-2 space-y-3 border-t border-muted">
            <Label>Categories</Label>
            <Select>
              <SelectTrigger className="w-full max-w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProjectPage() {
  const { data, loading, loadingMore, reload } = useInfiniteScroll<IResultPagination<Project>>(
    (d) =>
      getLoadMoreProjectList({
        offset: d ? d.pagination.currentPage * DEFAULT_PAGINATION_LIMIT : 0,
        limit: DEFAULT_PAGINATION_LIMIT,
        filterTags,
      }),
    {
      manual: true,
      target: document.querySelector('#scrollRef'),
      isNoMore: (data) => {
        return data ? !data.pagination.hasNextPage : false
      },
    },
  )
  const [filterTags, setFilterTags] = useState<string[]>([])

  useEffect(() => {
    reload()
  }, [filterTags, reload])
  const appearances = getAppearances()

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 lg:px-12">
      <div className="flex w-full flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Input placeholder="Search project title or description" className="bg-background/80 pl-8" />
            <LucideSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2" />
          </div>
          {appearances.showImportProject && <ImportProjectDialog />}
        </div>
        <div className="flex flex-col gap-2 lg:flex-row">
          <FilterBoard filterTags={filterTags} setFilterTags={setFilterTags} />
          <ProjectList loading={loading} loadingMore={loadingMore} data={data} />
        </div>
      </div>
    </div>
  )
}
