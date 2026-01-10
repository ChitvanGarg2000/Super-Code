import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowDown } from 'lucide-react'
const AddRepoButton = () => {
  return (
    <div className="group p-4 flex flex-row justify-between items-center border rounded-lg bg-muted cursor-pointer 
        transition-all duration-300 ease-in-out
        hover:bg-background hover:border-[#3846CE] hover:scale-[1.02]
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        hover:shadow-[0_10px_30px_rgba(56,70,206,0.15)]">
            <div className='flex flex-row justify-center items-center'>

                <Button variant={"outline"} className='flex justify-center items-center bg-white group-hover:bg-[#fff8f8] group-hover:border-[#3846CE] group-hover:text-white transition-colors duration-300'>
                    <ArrowDown size={30} className='transition-transform duration-300 group-hover:rotate-90' />
                </Button>

                <div className='ml-4 flex flex-col justify-center'>
                    <h3 className='text-lg font-medium text-[#3846CE] group-hover:text-white'>Open Github Repositories</h3>
                    <p className='text-sm text-muted-foreground'>Work with your existing project</p>
                </div>
            </div>

        </div>
  )
}

export default AddRepoButton