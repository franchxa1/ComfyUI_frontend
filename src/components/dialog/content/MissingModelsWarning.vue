<template>
  <NoResultsPlaceholder
    class="pb-0"
    icon="pi pi-exclamation-circle"
    title="Missing Models"
    message="When loading the graph, the following models were not found"
  />
  <ListBox :options="missingModels" class="comfy-missing-models">
    <template #option="{ option }">
      <FileDownload
        :url="option.url"
        :label="option.label"
        :error="option.error"
      />
    </template>
  </ListBox>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ListBox from 'primevue/listbox'
import NoResultsPlaceholder from '@/components/common/NoResultsPlaceholder.vue'
import FileDownload from '@/components/common/FileDownload.vue'

// TODO: Read this from server internal API rather than hardcoding here
// as some installations may wish to use custom sources
const allowedSources = [
  'https://civitai.com/',
  'https://huggingface.co/',
  'http://localhost:' // Included for testing usage only
]
const allowedSuffixes = ['.safetensors', '.sft']

interface ModelInfo {
  name: string
  directory: string
  directory_invalid?: boolean
  url: string
  downloading?: boolean
  completed?: boolean
  progress?: number
  error?: string
  folder_path?: string
}

const props = defineProps<{
  missingModels: ModelInfo[]
  paths: Record<string, string[]>
}>()

const modelDownloads = ref<Record<string, ModelInfo>>({})
const missingModels = computed(() => {
  return props.missingModels.map((model) => {
    const paths = props.paths[model.directory]
    if (model.directory_invalid || !paths) {
      return {
        label: `${model.directory} / ${model.name}`,
        url: model.url,
        error: 'Invalid directory specified (does this require custom nodes?)'
      }
    }
    const downloadInfo: ModelInfo = modelDownloads.value[model.name] ?? {
      downloading: false,
      completed: false,
      progress: 0,
      error: null,
      name: model.name,
      directory: model.directory,
      url: model.url,
      folder_path: paths[0]
    }
    modelDownloads.value[model.name] = downloadInfo
    if (!allowedSources.some((source) => model.url.startsWith(source))) {
      return {
        label: `${model.directory} / ${model.name}`,
        url: model.url,
        error: `Download not allowed from source '${model.url}', only allowed from '${allowedSources.join("', '")}'`
      }
    }
    if (!allowedSuffixes.some((suffix) => model.name.endsWith(suffix))) {
      return {
        label: `${model.directory} / ${model.name}`,
        url: model.url,
        error: `Only allowed suffixes are: '${allowedSuffixes.join("', '")}'`
      }
    }
    return {
      url: model.url,
      label: `${model.directory} / ${model.name}`,
      downloading: downloadInfo.downloading,
      completed: downloadInfo.completed,
      progress: downloadInfo.progress,
      error: downloadInfo.error,
      name: model.name,
      paths: paths,
      folderPath: downloadInfo.folder_path
    }
  })
})
</script>

<style scoped>
.comfy-missing-models {
  max-height: 300px;
  overflow-y: auto;
}
</style>
