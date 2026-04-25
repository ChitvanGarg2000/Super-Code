'use client'
import {useEffect, useRef, useState}  from 'react'
import { TemplateFolder } from '@/features/playground/lib/path-to-json'
import { useWebContainer } from '../hooks/useWebContainer';
import { UseWebContainerReturn } from '../interfaces';
import { WebContainer } from '@webcontainer/api';

interface WebContainerPreviewProps extends UseWebContainerReturn {
    templateData: TemplateFolder;
    instance: WebContainer | null;
}

const WebContainerPreview = () => {
  return (
    <div>WebContainerPreview</div>
  )
}

export default WebContainerPreview