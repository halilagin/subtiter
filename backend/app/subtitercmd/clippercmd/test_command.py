import click
import json
from .model.subtiter_model import RecognizedFacesBBoxes

def test_command():
    print("Test command")



@click.command("test1", help="parses face recognition json file")
@click.option("--input-file", type=click.Path(exists=True), required=True, help="Input file")
def test_1(input_file):
    json_data = json.load(open(input_file))
    fa = RecognizedFacesBBoxes.model_validate(json_data)

    # Sort frames by frame_id (key)
    sorted_frames = sorted(fa.root.items(), key=lambda item: item[0])

    # For each frame, sort the list of faces by face index
    final_dict = {
        frame_id: sorted(faces, key=lambda face: face.index)
        for frame_id, faces in sorted_frames
    }

    final_model = RecognizedFacesBBoxes.model_validate(final_dict)
    json_data = final_model.model_dump_json(indent=4)
    print(json_data)




@click.group("test")
def test_cli():
    """Subtiter Chat CLI Tool - Send messages to the chat API"""
    pass


# Add commands to the group

test_cli.add_command(test_1, name='test1')




if __name__ == "__main__":
    test_cli()