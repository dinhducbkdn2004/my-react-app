import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Card,
    CardMedia,
    List,
    ListSubheader,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    Grid,
    CardContent,
    Chip,
    Button,
    Skeleton,
    Divider,
    Alert,
    LinearProgress,
    useTheme,
    useMediaQuery,
    Fade,
    Backdrop,
    Tooltip,
} from '@mui/material';
import {
    Close as CloseIcon,
    Mood as MoodIcon,
    AccessTime as AccessTimeIcon,
    Face as FaceIcon,
    Delete as DeleteIcon,
    ImageNotSupported,
    ArrowBack as ArrowBackIcon,
    SentimentSatisfiedAlt,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { format } from 'date-fns';
import useApi from '../../hooks/useApi';
import { getEmotionDetectionById } from '../../services/emotionService';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const emotionColors = {
    happy: '#4caf50',
    sad: '#5c6bc0',
    angry: '#f44336',
    surprise: '#ff9800',
    fear: '#9c27b0',
    disgust: '#795548',
    neutral: '#607d8b',
    contempt: '#795548',
};

// Modal style
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95%', sm: '90%', md: '80%', lg: '75%' },
    maxWidth: 1200,
    maxHeight: { xs: '95vh', sm: '90vh' },
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    overflowY: 'auto',
};

const HistoryDetailModal = ({ open, onClose, item, onDelete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State for face details expansion
    const [expandedFaces, setExpandedFaces] = useState({});
    // State for delete confirmation
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    // State for highlighted face
    const [highlightedFace, setHighlightedFace] = useState(null);

    // Ref for results container - để quản lý scroll
    const resultsContainerRef = useRef(null);

    // Ref for rendering image with face boxes when detail data is unavailable
    const imageRef = useRef(null);
    const containerRef = useRef(null);

    // Use API hook to fetch detailed data
    const [fetchDetail, detailData, loading, error] = useApi(
        getEmotionDetectionById
    );

    // Fetch detailed data when modal opens
    useEffect(() => {
        if (open && item?.detection_id) {
            fetchDetail(item.detection_id);
            setExpandedFaces({}); // Reset expanded state
            setHighlightedFace(null); // Reset highlighted face
        }
    }, [open, item?.detection_id, fetchDetail]);

    // Scroll to highlighted face
    useEffect(() => {
        // Không cuộn tự động khi highlight thay đổi
    }, [highlightedFace]);

    // Handle delete confirmation
    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        if (onDelete && item?.detection_id) {
            onDelete(item.detection_id);
            onClose(); // Đóng modal chi tiết sau khi xóa
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
    };

    // Toggle face details
    const handleFaceClick = (faceIndex) => {
        setExpandedFaces((prev) => ({
            ...prev,
            [faceIndex]: !prev[faceIndex],
        }));
    };

    // Highlight face on hover - updated to work with FaceBoxOverlay
    const handleFaceHover = (faceIndex) => {
        setHighlightedFace(faceIndex);
    };

    const handleFaceLeave = () => {
        setHighlightedFace(null);
    };

    // Hàm mới để cuộn đến kết quả
    const handleScrollToFace = (faceIndex) => {
        if (resultsContainerRef.current) {
            const listItems =
                resultsContainerRef.current.querySelectorAll('.face-list-item');
            if (listItems && listItems[faceIndex]) {
                listItems[faceIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    };

    // Render skeleton loading
    const renderSkeleton = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
                <Grid container spacing={2}>
                    {[0, 1].map((item) => (
                        <Grid item xs={12} sm={6} key={item}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Skeleton
                                            variant="circular"
                                            width={40}
                                            height={40}
                                            sx={{ mr: 1.5 }}
                                        />
                                        <Box>
                                            <Skeleton
                                                variant="text"
                                                width={100}
                                            />
                                            <Skeleton
                                                variant="text"
                                                width={80}
                                            />
                                        </Box>
                                    </Box>
                                    {[0, 1, 2].map((i) => (
                                        <Box key={i} sx={{ mb: 1.5 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between',
                                                    mb: 0.5,
                                                }}
                                            >
                                                <Skeleton
                                                    variant="text"
                                                    width={80}
                                                />
                                                <Skeleton
                                                    variant="text"
                                                    width={40}
                                                />
                                            </Box>
                                            <Skeleton
                                                variant="rectangular"
                                                height={6}
                                                sx={{ borderRadius: 3 }}
                                            />
                                        </Box>
                                    ))}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );

    // Render image without face boxes
    const renderImage = () => {
        if (!detailData?.image_url) {
            return (
                <Box
                    sx={{
                        flex: 1,
                        width: '100%',
                        position: 'relative',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        height: { xs: 250, sm: 300, md: 400 },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'black',
                    }}
                >
                    <Box
                        component="img"
                        src={detailData?.image_url}
                        alt="Detection result"
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                        }}
                    />
                </Box>
            );
        }

        return (
            <Box
                sx={{
                    flex: 1,
                    width: '100%',
                    position: 'relative',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    height: { xs: 250, sm: 300, md: 400 },
                }}
            >
                <Box
                    component="img"
                    src={detailData.image_url}
                    alt="Detection result"
                    sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                />
            </Box>
        );
    };

    // Render emotion analysis results
    const renderEmotionResults = () => {
        if (!detailData?.detection_results?.face_detected) {
            return (
                <Alert
                    severity="info"
                    sx={{
                        borderRadius: 2,
                        mt: 2,
                        '& .MuiAlert-icon': {
                            fontSize: '2rem',
                        },
                    }}
                    icon={<SentimentSatisfiedAlt sx={{ fontSize: '2rem' }} />}
                >
                    No faces detected in this image
                </Alert>
            );
        }

        return (
            <List
                sx={{
                    width: '100%',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    '& .MuiListItemButton-root': {
                        borderRadius: 2,
                        mb: 1,
                        '&:last-child': {
                            mb: 0,
                        },
                    },
                }}
                component="nav"
                aria-labelledby="emotion-detection-results"
            >
                {detailData.detection_results.faces.map((face, faceIndex) => {
                    const primaryEmotion = face.emotions[0];
                    const primaryEmotionColor =
                        emotionColors[primaryEmotion.emotion] ||
                        theme.palette.primary.main;
                    const isExpanded = expandedFaces[faceIndex] || false;

                    return (
                        <Box key={faceIndex} className="face-list-item">
                            <ListItemButton
                                onClick={() => handleFaceClick(faceIndex)}
                                onMouseEnter={() => handleFaceHover(faceIndex)}
                                onMouseLeave={handleFaceLeave}
                                sx={{
                                    bgcolor:
                                        highlightedFace === faceIndex
                                            ? theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.05)'
                                            : theme.palette.mode === 'dark'
                                            ? 'rgba(255,255,255,0.05)'
                                            : 'rgba(0,0,0,0.02)',
                                    borderLeft: `4px solid ${primaryEmotionColor}`,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.1)'
                                                : 'rgba(0,0,0,0.05)',
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: `${primaryEmotionColor}15`,
                                            color: primaryEmotionColor,
                                        }}
                                    >
                                        <FaceIcon />
                                    </Box>
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="medium"
                                        >
                                            Face #{faceIndex + 1}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: primaryEmotionColor,
                                                fontWeight: 'medium',
                                            }}
                                        >
                                            {primaryEmotion.emotion
                                                .charAt(0)
                                                .toUpperCase() +
                                                primaryEmotion.emotion.slice(
                                                    1
                                                )}{' '}
                                            (
                                            {primaryEmotion.percentage.toFixed(
                                                1
                                            )}
                                            %)
                                        </Typography>
                                    }
                                />
                                {isExpanded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                            <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    {face.emotions.map((emotion, index) => (
                                        <ListItemButton
                                            key={index}
                                            sx={{
                                                pl: 4,
                                                py: 0.5,
                                            }}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems:
                                                                'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                flex: 1,
                                                                color:
                                                                    index === 0
                                                                        ? emotionColors[
                                                                              emotion
                                                                                  .emotion
                                                                          ]
                                                                        : 'text.primary',
                                                                fontWeight:
                                                                    index === 0
                                                                        ? 'bold'
                                                                        : 'normal',
                                                            }}
                                                        >
                                                            {emotion.emotion
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                emotion.emotion.slice(
                                                                    1
                                                                )}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color:
                                                                    index === 0
                                                                        ? emotionColors[
                                                                              emotion
                                                                                  .emotion
                                                                          ]
                                                                        : 'text.secondary',
                                                                fontWeight:
                                                                    index === 0
                                                                        ? 'bold'
                                                                        : 'normal',
                                                                ml: 2,
                                                            }}
                                                        >
                                                            {emotion.percentage.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                ml: 2,
                                                                flex: 1,
                                                                height: 4,
                                                                borderRadius: 2,
                                                                bgcolor:
                                                                    theme
                                                                        .palette
                                                                        .mode ===
                                                                    'dark'
                                                                        ? 'rgba(255,255,255,0.12)'
                                                                        : 'rgba(0,0,0,0.05)',
                                                                overflow:
                                                                    'hidden',
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: `${emotion.percentage}%`,
                                                                    height: '100%',
                                                                    bgcolor:
                                                                        emotionColors[
                                                                            emotion
                                                                                .emotion
                                                                        ],
                                                                    transition:
                                                                        'width 1s ease-in-out',
                                                                }}
                                                            />
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    );
                })}
            </List>
        );
    };

    // Modal content
    const modalContent = () => {
        if (!item) return null;

        return (
            <>
                <Box
                    sx={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'visible',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: { xs: 2, md: 3 },
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                            p: { xs: 1.5, md: 2 },
                            borderRadius: 3,
                        }}
                    >
                        <Typography
                            variant={isMobile ? 'h6' : 'h5'}
                            fontWeight="bold"
                            sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '0.5px',
                                fontSize: {
                                    xs: '1.1rem',
                                    sm: '1.25rem',
                                    md: '1.5rem',
                                },
                            }}
                        >
                            Emotion Detection Details
                        </Typography>

                        <IconButton
                            onClick={onClose}
                            size={isMobile ? 'small' : 'medium'}
                            sx={{
                                bgcolor: 'background.paper',
                                boxShadow: theme.shadows[2],
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'background.default',
                                    transform: 'scale(1.1)',
                                },
                            }}
                        >
                            <CloseIcon
                                fontSize={isMobile ? 'small' : 'medium'}
                            />
                        </IconButton>
                    </Box>

                    {/* Loading indicator */}
                    {loading && (
                        <Box sx={{ width: '100%', mb: 2 }}>
                            <LinearProgress
                                sx={{
                                    borderRadius: 1,
                                    height: 6,
                                    '& .MuiLinearProgress-bar': {
                                        borderRadius: 1,
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Error message */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                '& .MuiAlert-icon': {
                                    fontSize: '1.5rem',
                                },
                            }}
                        >
                            Unable to load details. Please try again later.
                        </Alert>
                    )}

                    {/* Main Content */}
                    {loading ? (
                        renderSkeleton()
                    ) : detailData ? (
                        <Box
                            sx={{
                                flex: 1,
                                overflow: 'visible',
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: {xs: 'column', md: 'row'},
                                    gap: { xs: 2, md: 3 },
                                    mb: { xs: 2, md: 3 },
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    {renderImage()}
                                </Box>

                                {/* Info */}
                                <Box sx={{ flex: 1 }}>
                                    <Box
                                        sx={{
                                            p: { xs: 1.5, md: 2 },
                                            borderRadius: 2,
                                            bgcolor:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.05)'
                                                    : 'rgba(0,0,0,0.02)',
                                            mb: { xs: 1.5, md: 2 },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1,
                                            }}
                                        >
                                            <AccessTimeIcon
                                                fontSize={
                                                    isMobile
                                                        ? 'small'
                                                        : 'medium'
                                                }
                                                sx={{
                                                    mr: 1,
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                fontWeight="medium"
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.75rem',
                                                        md: '0.875rem',
                                                    },
                                                }}
                                            >
                                                Detection Time
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant={
                                                isMobile ? 'body2' : 'body1'
                                            }
                                            fontWeight="medium"
                                        >
                                            {format(
                                                new Date(detailData.timestamp),
                                                'dd/MM/yyyy HH:mm:ss'
                                            )}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={
                                            <DeleteIcon
                                                fontSize={
                                                    isMobile
                                                        ? 'small'
                                                        : 'medium'
                                                }
                                            />
                                        }
                                        onClick={handleDeleteClick}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            mb: { xs: 2, md: 3 },
                                            fontSize: {
                                                xs: '0.75rem',
                                                md: '0.875rem',
                                            },
                                        }}
                                        fullWidth={isMobile}
                                        size={isMobile ? 'small' : 'medium'}
                                    >
                                        Delete Result
                                    </Button>
                                </Box>
                            </Box>

                            {/* Results - add ref and improve scroll */}
                            <Box
                                ref={resultsContainerRef}
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    pr: { xs: 0.5, md: 1 },
                                    maxHeight: {
                                        xs: '300px',
                                        sm: '400px',
                                        md: '450px',
                                    },
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                        borderRadius: '2px',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        background: 'transparent',
                                        margin: '2px 0',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        background:
                                            theme.palette.mode === 'dark'
                                                ? 'rgba(255,255,255,0.2)'
                                                : 'rgba(0,0,0,0.3)',
                                        borderRadius: '4px',
                                        border:
                                            theme.palette.mode === 'dark'
                                                ? '2px solid rgba(0,0,0,0.4)'
                                                : '2px solid rgba(255,255,255,0.8)',
                                        minHeight: '40px',
                                        '&:hover': {
                                            background:
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255,255,255,0.3)'
                                                    : 'rgba(0,0,0,0.5)',
                                        },
                                    },
                                }}
                            >
                                <Typography
                                    variant={
                                        isMobile
                                            ? 'subtitle1'
                                            : isTablet
                                            ? 'h6'
                                            : 'h5'
                                    }
                                    fontWeight="bold"
                                    sx={{
                                        mb: { xs: 1, md: 2 },
                                        color: theme.palette.primary.main,
                                    }}
                                >
                                    Emotion Detection Results
                                </Typography>

                                {detailData.detection_results && (
                                    <Box>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor:
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? 'rgba(255,255,255,0.05)'
                                                        : 'rgba(0,0,0,0.02)',
                                            }}
                                        >
                                            <FaceIcon
                                                sx={{
                                                    mr: 1,
                                                    color: theme.palette.primary
                                                        .main,
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                fontWeight="medium"
                                            >
                                                {detailData.detection_results
                                                    .face_detected
                                                    ? `${detailData.detection_results.faces.length} faces detected`
                                                    : 'No faces detected'}
                                            </Typography>
                                        </Box>

                                        {renderEmotionResults()}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    ) : null}
                </Box>

                {/* Confirm Delete Modal */}
                <ConfirmDeleteModal
                    open={deleteConfirmOpen}
                    onClose={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    item={item}
                />
            </>
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="emotion-detection-detail-modal"
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={open}>
                <Box sx={modalStyle}>{modalContent()}</Box>
            </Fade>
        </Modal>
    );
};

export default HistoryDetailModal;
