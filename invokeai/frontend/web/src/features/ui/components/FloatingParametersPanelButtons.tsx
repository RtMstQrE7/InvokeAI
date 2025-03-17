import { ButtonGroup, Flex, Icon, IconButton, spinAnimation, Tooltip, useShiftModifier } from '@invoke-ai/ui-library';
import { useAppSelector } from 'app/store/storeHooks';
import { ToolChooser } from 'features/controlLayers/components/Tool/ToolChooser';
import { CanvasManagerProviderGate } from 'features/controlLayers/contexts/CanvasManagerProviderGate';
import { useImageViewer } from 'features/gallery/components/ImageViewer/useImageViewer';
import { useCancelAllExceptCurrentQueueItemDialog } from 'features/queue/components/CancelAllExceptCurrentQueueItemConfirmationAlertDialog';
import { useClearQueueDialog } from 'features/queue/components/ClearQueueConfirmationAlertDialog';
import { InvokeButtonTooltip } from 'features/queue/components/InvokeButtonTooltip/InvokeButtonTooltip';
import { useCancelCurrentQueueItem } from 'features/queue/hooks/useCancelCurrentQueueItem';
import { useInvoke } from 'features/queue/hooks/useInvoke';
import { useFeatureStatus } from 'features/system/hooks/useFeatureStatus';
import type { UsePanelReturn } from 'features/ui/hooks/usePanel';
import { selectActiveTab } from 'features/ui/store/uiSelectors';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PiCircleNotchBold,
  PiLightningFill,
  PiSlidersHorizontalBold,
  PiSparkleFill,
  PiTrashSimpleBold,
  PiXBold,
  PiXCircle,
} from 'react-icons/pi';
import { useGetQueueStatusQuery } from 'services/api/endpoints/queue';

type Props = {
  panelApi: UsePanelReturn;
};

const FloatingSidePanelButtons = (props: Props) => {
  const { t } = useTranslation();
  const shift = useShiftModifier();
  const tab = useAppSelector(selectActiveTab);
  const imageViewer = useImageViewer();
  const isCancelAndClearAllEnabled = useFeatureStatus('cancelAndClearAll');

  return (
    <Flex pos="absolute" transform="translate(0, -50%)" top="50%" insetInlineStart={2} direction="column" gap={2}>
      {tab === 'canvas' && !imageViewer.isOpen && (
        <CanvasManagerProviderGate>
          <ToolChooser />
        </CanvasManagerProviderGate>
      )}
      <ButtonGroup orientation="vertical" h={48}>
        <Tooltip label={t('accessibility.toggleLeftPanel')} placement="end">
          <IconButton
            aria-label={t('accessibility.toggleLeftPanel')}
            onClick={props.panelApi.toggle}
            icon={<PiSlidersHorizontalBold />}
            flexGrow={1}
          />
        </Tooltip>
        <InvokeButtonTooltip prepend={shift} placement="end">
          <InvokeIconButton />
        </InvokeButtonTooltip>
        <Tooltip label={t('queue.cancelTooltip')} placement="end">
          <CancelCurrentIconButton />
        </Tooltip>
        {/* Show the cancel all except current button instead of cancel and clear all when it is disabled */}
        {isCancelAndClearAllEnabled && (
          <Tooltip label={t('queue.clearTooltip')} placement="end">
            <CancelAndClearAllIconButton />
          </Tooltip>
        )}
        {!isCancelAndClearAllEnabled && (
          <Tooltip label={t('queue.cancelAllExceptCurrentTooltip')} placement="end">
            <CancelAllExceptCurrentIconButton />
          </Tooltip>
        )}
      </ButtonGroup>
    </Flex>
  );
};

export default memo(FloatingSidePanelButtons);

const InvokeIconButton = memo(() => {
  const { t } = useTranslation();
  const queue = useInvoke();
  const shift = useShiftModifier();
  const { data: queueStatus } = useGetQueueStatusQuery();

  const queueButtonIcon = useMemo(() => {
    const isProcessing = (queueStatus?.queue.in_progress ?? 0) > 0;
    if (!queue.isDisabled && isProcessing) {
      return <Icon boxSize={6} as={PiCircleNotchBold} animation={spinAnimation} />;
    }
    if (shift) {
      return <PiLightningFill />;
    }
    return <PiSparkleFill />;
  }, [queue.isDisabled, queueStatus?.queue.in_progress, shift]);

  return (
    <IconButton
      aria-label={t('queue.queueBack')}
      onClick={shift ? queue.queueFront : queue.queueBack}
      isLoading={queue.isLoading}
      isDisabled={queue.isDisabled}
      icon={queueButtonIcon}
      colorScheme="invokeYellow"
      flexGrow={1}
    />
  );
});
InvokeIconButton.displayName = 'InvokeIconButton';

const CancelCurrentIconButton = memo(() => {
  const { t } = useTranslation();
  const cancelCurrentQueueItem = useCancelCurrentQueueItem();

  return (
    <IconButton
      isDisabled={cancelCurrentQueueItem.isDisabled}
      isLoading={cancelCurrentQueueItem.isLoading}
      aria-label={t('queue.cancelTooltip')}
      icon={<PiXBold />}
      onClick={cancelCurrentQueueItem.cancelQueueItem}
      colorScheme="error"
      flexGrow={1}
    />
  );
});

CancelCurrentIconButton.displayName = 'CancelCurrentIconButton';

const CancelAndClearAllIconButton = memo(() => {
  const { t } = useTranslation();
  const clearQueue = useClearQueueDialog();

  return (
    <IconButton
      isDisabled={clearQueue.isDisabled}
      isLoading={clearQueue.isLoading}
      aria-label={t('queue.clearTooltip')}
      icon={<PiTrashSimpleBold />}
      colorScheme="error"
      onClick={clearQueue.openDialog}
      flexGrow={1}
    />
  );
});

CancelAndClearAllIconButton.displayName = 'CancelAndClearAllIconButton';

const CancelAllExceptCurrentIconButton = memo(() => {
  const { t } = useTranslation();
  const cancelAllExceptCurrent = useCancelAllExceptCurrentQueueItemDialog();

  return (
    <IconButton
      isDisabled={cancelAllExceptCurrent.isDisabled}
      isLoading={cancelAllExceptCurrent.isLoading}
      aria-label={t('queue.clear')}
      icon={<PiXCircle />}
      colorScheme="error"
      onClick={cancelAllExceptCurrent.openDialog}
      flexGrow={1}
    />
  );
});

CancelAllExceptCurrentIconButton.displayName = 'CancelAllExceptCurrentIconButton';
