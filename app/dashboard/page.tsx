export const dynamic = "force-dynamic";

import AddNewButton from '@/features/dashboard/components/AddNewButton'
import AddRepoButton from '@/features/dashboard/components/AddRepoButton'
import { EmptyState } from '@/components/ui/empty-state'
import { PlayGround } from '@/interfaces'
import { getAllPlaygrounds, deletePlaygroundById, updatePlaygroundById, duplicatePlaygroundById } from '@/features/dashboard/actions'
import ProjectsTable from '@/features/dashboard/components/ProjectsTable'

const page = async () => {
  const playgrounds: PlayGround[] = await getAllPlaygrounds() || [];
  return (
    <div className='flex flex-col justify-start items-center min-h-screen max-w-7xl px-4 py-10'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full'>
        <AddNewButton />
        <AddRepoButton />
      </div>
      <div className='flex flex-col justify-center items-center w-full mt-10'>
        {playgrounds.length === 0 ? (
          <div className='text-center text-muted-foreground py-4 w-full'>
            <EmptyState title="No Playgrounds Yet" description="Get started by creating a new playground or adding an existing repository." imageSrc="/empty-state.svg" />
          </div>
        ): (
          <ProjectsTable projects={playgrounds} onUpdateProject={updatePlaygroundById} onDeleteProject={deletePlaygroundById} onDuplicateProject={duplicatePlaygroundById} />
        )}
      </div>
    </div>
  )
}

export default page