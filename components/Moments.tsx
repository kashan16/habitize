"use client";

import { useAuth } from '@/hooks/useAuth';
import { useMoments } from '@/hooks/useMoment';
import React, { useState } from 'react'
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { FiClock, FiPlus, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow, parseISO } from 'date-fns';

const MomentCardSkeleton = () => (
  <div className='p-4 rounded-lg bg-white dark:bg-slate-800/50 animate-pulse'>
    <div className='flex justify-end items-center mb-4'>
      <div className='h-4 w-24 rounded-md bg-gray-200 dark:bg-slate-700'/>
    </div>
    <div className='space-y-2'>
      <div className='h-4 rounded-md bg-gray=200 dark:bg-slate-700'/>
      <div className='h-4 w-3/4 rounded-md bg-gray-200 dark:bg-slate-700'/>
    </div>
  </div>
);

const Moments = () => {
  const { user } = useAuth();
  const { moments , isLoading , addMoment , deleteMoment } = useMoments();
  const [ newText , setNewText ] = useState('');

  const handleAddMoment = async (e : React.FormEvent) => {
    e.preventDefault();
    if(!newText.trim()) return;
    await addMoment({ text : newText });
    setNewText('');
  };

  if(!user) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-slate-800/50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
          Capture your thoughts.
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Sign in to save your memorable moments.
        </p>
      </div>
    )
  }  
  return (
    <div className='py-8 max-w-2xl mx-auto'>
      <div className='mb-12'>
        <h1 className='text-3xl font-bold text-gray-800 dark:text-white mb-4'>
          My Moments
        </h1>
        <form onSubmit={handleAddMoment} className='p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm'>
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className='w-full text-base border-gray-200 dark:border-slate-700'/>
            <div className='flex justify-end items-center mt-3'>
              <Button type='submit' disabled={!newText.trim() || isLoading}>
                <FiPlus className='h-4 w-4'/>
              </Button>
            </div>
        </form>
      </div>
      <div className='space-y-4'>
        {isLoading && (
          <>
            <MomentCardSkeleton/>
            <MomentCardSkeleton/>
            <MomentCardSkeleton/>
          </>
        )}
        {!isLoading && moments.length === 0 && (
          <div className='text-center py-16 border-2 border-dashed border-gray-200 dark:border:gray-700 rounded-lg'>
            <h3 className='text-xl font-semibold text-gray-800 dark:text-white'>
              No moments captured yet.
            </h3>
            <p className='mt-2 text-gray-500 dark:text-gray-400'>
              Use the form above to save your first thougt.
            </p>
          </div>
        )}
        {!isLoading && moments.map((moment) => (
          <div key={moment.id}
            className='group relative p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm transtion shadow hover:shadow-md'>
              <div className='flex justify-between items-center mb-3 pb-3 border-b border-gray-100 dark:border-slate-700/50'>
                <div className='flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                  <FiClock className='h-4 w-4'/>
                  <span>{formatDistanceToNow(parseISO(moment.created_at),{ addSuffix : true })}</span>
                </div>
                <Button size="icon" variant="ghost"
                  onClick={() => deleteMoment(moment.id)}
                  className='h-8 w-8 rounded-full text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100'
                  aria-label='Delete moment'>
                    <FiTrash2 className='h-4 w-4'/>
                  </Button>
              </div>
              <p className='text-gray-700 dark:text-slate-200 whitespace-pre-wrap'>
                {moment.text}
              </p>
            </div>
        ))}
      </div>
    </div>
  );
}

export default Moments