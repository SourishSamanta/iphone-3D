import React, {
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useEffect
} from "react";
import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    BloomPlugin,
    GammaCorrectionPlugin,
    mobileAndTabletCheck,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollAnimation } from "../lib/scroll-animation";

gsap.registerPlugin(ScrollTrigger);


function WebgiViewer() {
    const CanvasRef = useRef(null);
    const memoizedScrollAnimation = useCallback((position,target,onUpdate) => {
        if(position && target && onUpdate){
            ScrollAnimation(position,target,onUpdate);
        }
    },[]);
    
    const setupViewer = useCallback(async () => {
        // Initialize the viewer
        const viewer = new ViewerApp({
            canvas: CanvasRef.current,
        });

        const manager = await viewer.addPlugin(AssetManagerPlugin);

        const camera = viewer.scene.activeCamera;
        const position = camera.position;
        const target = camera.target;

        
        await viewer.addPlugin(GBufferPlugin)
        await viewer.addPlugin(new ProgressivePlugin(32))
        await viewer.addPlugin(new TonemapPlugin(true))
        await viewer.addPlugin(GammaCorrectionPlugin)
        await viewer.addPlugin(SSRPlugin)
        await viewer.addPlugin(SSAOPlugin)
        await viewer.addPlugin(BloomPlugin)
        

        

        

        viewer.renderer.refreshPipeline();

        // Import and add a GLB file.
        await manager.addFromPath("scene-black.glb");

        viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

        camera.setCameraOptions({ controlsEnabled: false });

        window.scrollTo(0,0);

        let needsUpdate = true;

        const onUpdate = () => {
            needsUpdate = true;
            viewer.setDirty();
        }

        viewer.addEventListener("preFrame",()=>{

            if(needsUpdate){
                camera.positionTargetUpdated(true);
                needsUpdate = false;
            }

        })

        memoizedScrollAnimation(position,target,onUpdate);

        
    }, []);

    useEffect(() => {
      setupViewer();
    }, []);
    

    return (
        <div id="webgi-canvas-container">
            <canvas id="webgi-canvas" ref={CanvasRef} />
        </div>
    );
}

export default WebgiViewer;
