//! F-043: a Save's encode region is reused by later Saves without zeroing.
//! The frames, and so the stored bytes, must not depend on what the region
//! held before: the same input gives the same frame from a fresh workspace
//! and from a reused region, even one filled with a poison pattern.
use layerfs_storage::encoding::{CodecProfile, CompressionWorkspace};
use layerfs_storage::{StorageCapacities, StoragePolicy};

fn inputs() -> Vec<Vec<u8>> {
    let mut state = 0x0f04_3f04_3f04_3f04_u64;
    let mut random = |n: usize| -> Vec<u8> {
        (0..n)
            .map(|_| {
                state ^= state << 13;
                state ^= state >> 7;
                state ^= state << 17;
                state as u8
            })
            .collect()
    };
    let text: Vec<u8> = b"export function f(x) { return x + 1; }\n"
        .iter()
        .copied()
        .cycle()
        .take(60_000)
        .collect();
    vec![
        random(5_000),
        text.clone(),
        random(120_000),
        text[..777].to_vec(),
    ]
}

/// Every frame kind a Save makes: whole, against a prefix, and group bodies.
fn frames(workspace: &mut CompressionWorkspace, profile: CodecProfile) -> Vec<Vec<u8>> {
    let inputs = inputs();
    let mut out = Vec::new();
    for raw in &inputs {
        out.push(workspace.compress(profile, raw).unwrap());
    }
    out.push(
        workspace
            .compress_prefix(profile, &inputs[1][..50_000], &inputs[1])
            .unwrap(),
    );
    out.push(
        workspace
            .compress_prefix(profile, &inputs[3], &inputs[0])
            .unwrap(),
    );
    out.push(workspace.compress_group(&inputs[0]).unwrap());
    out.push(workspace.compress_group(&inputs[1][..20_000]).unwrap());
    out
}

#[test]
fn reused_and_poisoned_encode_regions_give_byte_identical_frames() {
    let capacities = StorageCapacities::from_policy(StoragePolicy::new(1, 131_072, 8, 4)).unwrap();
    let profile = CodecProfile::whole_file(&capacities);
    let fresh = frames(&mut CompressionWorkspace::new().unwrap(), profile);
    // A region that has encoded other data, several times over, as Saves do.
    let mut region = CompressionWorkspace::new().unwrap().into_region();
    for round in 0..4 {
        let mut workspace = CompressionWorkspace::in_region(region).unwrap();
        assert_eq!(
            frames(&mut workspace, profile),
            fresh,
            "reused round {round}"
        );
        region = workspace.into_region();
    }
    // A region holding none of zstd's own state at all.
    for pattern in [u64::MAX, 0xa5a5_a5a5_a5a5_a5a5, 0x0123_4567_89ab_cdef] {
        region.fill(pattern);
        let mut workspace = CompressionWorkspace::in_region(region).unwrap();
        assert_eq!(
            frames(&mut workspace, profile),
            fresh,
            "poison {pattern:#x}"
        );
        region = workspace.into_region();
    }
}

#[test]
fn a_region_of_another_size_is_refused() {
    assert!(CompressionWorkspace::in_region(vec![0; 1024]).is_err());
}
